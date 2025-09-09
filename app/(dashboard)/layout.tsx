import DashboardLayout from '@/components/layouts.tsx/dashboard-layout';

export default function DashboardRootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <DashboardLayout>{children}</DashboardLayout>;
}
