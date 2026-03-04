"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
    { name: 'Mon', Twitter: 3400, LinkedIn: 2400, Instagram: 2400 },
    { name: 'Tue', Twitter: 3000, LinkedIn: 2908, Instagram: 2210 },
    { name: 'Wed', Twitter: 2000, LinkedIn: 5800, Instagram: 2290 },
    { name: 'Thu', Twitter: 2780, LinkedIn: 3908, Instagram: 2000 },
    { name: 'Fri', Twitter: 1890, LinkedIn: 4800, Instagram: 2181 },
    { name: 'Sat', Twitter: 2390, LinkedIn: 3800, Instagram: 2500 },
    { name: 'Sun', Twitter: 3490, LinkedIn: 4300, Instagram: 2100 },
];

export function PlatformChart() {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--surface-elevated))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--text-primary))' }}
                    itemStyle={{ color: 'hsl(var(--text-primary))' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="Twitter" fill="var(--twitter)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="LinkedIn" fill="var(--linkedin)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Instagram" fill="var(--instagram)" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
        </ResponsiveContainer>
    );
}
