import prisma from "@/lib/prisma";

interface InstagramPublishResult {
  success: boolean;
  postId?: string;
  error?: string;
}

function isVideoUrl(url: string): boolean {
  return (
    url.includes("/video/upload/") ||
    /\.(mp4|mov|avi|mkv|webm)(\?|$)/i.test(url)
  );
}

export async function refreshInstagramTokenIfNeeded(socialAccount: {
  id: string;
  accessToken: string;
  expiresAt: Date | null;
}) {
  if (!socialAccount.expiresAt) return socialAccount.accessToken;

  // Instagram long-lived tokens last 60 days; refresh when within 7 days of expiry
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  if (socialAccount.expiresAt > sevenDaysFromNow) {
    return socialAccount.accessToken;
  }

  try {
    const res = await fetch(
      `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${socialAccount.accessToken}`,
    );
    const data = await res.json();

    if (!res.ok || !data.access_token) {
      throw new Error(
        `Token refresh failed: ${data.error?.message ?? "unknown"}`,
      );
    }

    const updated = await prisma.socialAccount.update({
      where: { id: socialAccount.id },
      data: {
        accessToken: data.access_token,
        expiresAt: new Date(Date.now() + (data.expires_in ?? 5184000) * 1000),
      },
    });

    console.log(`[Instagram Renewed Token] Account ID: ${updated.platformId}`);
    return updated.accessToken;
  } catch (error) {
    console.error("[Instagram Token Refresh Failed]", error);
    throw error;
  }
}

// Instagram videos need a polling step before publishing
async function waitForContainerReady(
  containerId: string,
  accessToken: string,
  maxAttempts = 12,
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `https://graph.instagram.com/${containerId}?fields=status_code&access_token=${accessToken}`,
    );
    const data = await res.json();

    if (data.status_code === "FINISHED") return;
    if (data.status_code === "ERROR") {
      throw new Error(
        `Media container processing failed: ${data.status ?? "unknown error"}`,
      );
    }

    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error("Timed out waiting for Instagram media container");
}

async function createMediaContainer(
  baseUrl: string,
  params: Record<string, string>,
  label: string,
): Promise<string> {
  const res = await fetch(`${baseUrl}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json();

  if (!res.ok || !data.id) {
    console.error(`[Instagram ${label} Container Error]`, data);
    throw new Error(
      data.error?.message ?? `HTTP ${res.status} creating ${label}`,
    );
  }

  return data.id as string;
}

export async function publishToInstagram(
  content: string,
  mediaUrls: string[],
  socialAccountId: string,
): Promise<InstagramPublishResult> {
  try {
    const account = await prisma.socialAccount.findUnique({
      where: { id: socialAccountId },
    });

    if (!account || account.platform !== "INSTAGRAM") {
      return {
        success: false,
        error: "Social account not found or is not Instagram",
      };
    }

    if (account.status !== "ACTIVE") {
      return {
        success: false,
        error: "Instagram account is not active (needs reconnect)",
      };
    }

    if (mediaUrls.length === 0) {
      return {
        success: false,
        error:
          "Instagram requires at least one image or video — text-only posts are not supported",
      };
    }

    let activeToken: string;
    try {
      activeToken = await refreshInstagramTokenIfNeeded(account);
    } catch (tokenErr) {
      await prisma.socialAccount.update({
        where: { id: account.id },
        data: { status: "DISCONNECTED" },
      });
      const msg =
        tokenErr instanceof Error ? tokenErr.message : String(tokenErr);
      return {
        success: false,
        error: `Authentication expired. Please reconnect: ${msg}`,
      };
    }

    const baseUrl = `https://graph.instagram.com/${account.platformId}`;
    let creationId: string;

    if (mediaUrls.length === 1) {
      const url = mediaUrls[0];
      const isVideo = isVideoUrl(url);

      const params: Record<string, string> = {
        caption: content,
        access_token: activeToken,
      };

      if (isVideo) {
        params.media_type = "REELS";
        params.video_url = url;
      } else {
        params.image_url = url;
      }

      creationId = await createMediaContainer(
        baseUrl,
        params,
        isVideo ? "Reel" : "Image",
      );

      if (isVideo) {
        await waitForContainerReady(creationId, activeToken);
      }
    } else {
      // Carousel — create child containers first, then the parent
      const childIds: string[] = [];

      for (const url of mediaUrls) {
        const isVideo = isVideoUrl(url);
        const params: Record<string, string> = {
          is_carousel_item: "true",
          access_token: activeToken,
        };

        if (isVideo) {
          params.media_type = "VIDEO";
          params.video_url = url;
        } else {
          params.image_url = url;
        }

        const childId = await createMediaContainer(
          baseUrl,
          params,
          `Carousel child (${isVideo ? "video" : "image"})`,
        );

        if (isVideo) {
          await waitForContainerReady(childId, activeToken);
        }

        childIds.push(childId);
      }

      creationId = await createMediaContainer(
        baseUrl,
        {
          media_type: "CAROUSEL",
          children: childIds.join(","),
          caption: content,
          access_token: activeToken,
        },
        "Carousel",
      );
    }

    // Publish the prepared container
    const publishRes = await fetch(`${baseUrl}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: activeToken,
      }),
    });
    const publishData = await publishRes.json();

    if (!publishRes.ok || !publishData.id) {
      console.error("[Instagram Publish Error]", publishData);
      return {
        success: false,
        error:
          publishData.error?.message ??
          `HTTP ${publishRes.status} on media_publish`,
      };
    }

    return { success: true, postId: publishData.id as string };
  } catch (error) {
    console.error("[Instagram Publish Exception]", error);
    const msg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: msg || "Unknown error during Instagram publish",
    };
  }
}
