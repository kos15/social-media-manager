import { renderHook, act } from '@testing-library/react';
import { usePostStore } from '@/store/usePostStore';

describe('usePostStore', () => {
    beforeEach(() => {
        // Reset the store before each test
        const store = usePostStore.getState();
        store.resetPost();
    });

    it('should initialize with default values', () => {
        const { result } = renderHook(() => usePostStore());
        expect(result.current.currentPost).toBe('');
        expect(result.current.mediaUrls).toEqual([]);
        expect(result.current.selectedPlatforms).toEqual([]);
        expect(result.current.scheduledDate).toBeNull();
    });

    it('should set post content', () => {
        const { result } = renderHook(() => usePostStore());
        act(() => {
            result.current.setPostContent('Hello World');
        });
        expect(result.current.currentPost).toBe('Hello World');
    });

    it('should toggle platforms correctly', () => {
        const { result } = renderHook(() => usePostStore());

        // Add a platform
        act(() => {
            result.current.togglePlatform('TWITTER');
        });
        expect(result.current.selectedPlatforms).toEqual(['TWITTER']);

        // Add another platform
        act(() => {
            result.current.togglePlatform('LINKEDIN');
        });
        expect(result.current.selectedPlatforms).toEqual(['TWITTER', 'LINKEDIN']);

        // Remove the first platform
        act(() => {
            result.current.togglePlatform('TWITTER');
        });
        expect(result.current.selectedPlatforms).toEqual(['LINKEDIN']);
    });
});
