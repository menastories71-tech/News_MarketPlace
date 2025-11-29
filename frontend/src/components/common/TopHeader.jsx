import React, { useState } from 'react';
import Icon from './Icon';
import { useAuth } from '../../context/AuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useAuthModal } from '../../App';

const TopHeader = () => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [mobileShowAllItems, setMobileShowAllItems] = useState(false);
	const { isAuthenticated } = useAuth();
	const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();
	const { showAuthModal } = useAuthModal();

	const navigationItems = [
		{
			href: "/services-overview",
			text: "Services",
			icon: "cog-6-tooth",
			description: "Learn about our services",
			hasAuthCheck: false
		},
		{
			href: "/how-it-works",
			text: "How It Works",
			icon: "question-mark-circle",
			description: "Step-by-step platform instructions",
			hasAuthCheck: false
		},
		{
			href: "/blogs",
			text: "Blog",
			icon: "document-text",
			description: "Browse published articles and press releases",
			hasAuthCheck: true
		},
		{
			href: "/media-partnerships",
			text: "Media Partnerships",
			icon: "users",
			description: "Media partnership information",
			hasAuthCheck: false
		}
	];

	const actionItems = [
		{ name: 'Agency Registration', href: '/agency-registration', icon: 'user-group', color: '#4CAF50', isLink: true, hasAuthCheck: false },
		{ name: 'Editor Registration', href: '#', icon: 'user', color: '#1976D2', isLink: false, hasAuthCheck: true },
		{ name: 'Reporter Registration', href: '/reporter-registration', icon: 'user-plus', color: '#FF5722', isLink: true, hasAuthCheck: false },
		{ name: 'Submit Publication', href: '#', icon: 'document-plus', color: '#9C27B0', isLink: false, hasAuthCheck: true }
	];

	const allItems = [
		...navigationItems.map(item => ({ name: item.text, href: item.href, icon: item.icon, hasAuthCheck: item.hasAuthCheck, isLink: false })),
		...actionItems.map(item => ({ name: item.name, href: item.href, icon: item.icon, hasAuthCheck: item.hasAuthCheck, isLink: item.isLink }))
	];

	// Updated responsive breakpoint logic to show more services directly
	const getDisplayedServices = (breakpoint) => {
		switch (breakpoint) {
			case 'sm': return services.slice(0, 4); // Show 4 services including Paparazzi
			case 'md': return services.slice(0, 5); // Show 5 services including Power List
			case 'lg': return services.slice(0, 6); // Show 6 services on desktop
			case 'xl': return services.slice(0, 7); // Show 7 services on large desktop
			default: return services.slice(0, 5);
		}
	};

	const getMoreServices = (breakpoint) => {
		switch (breakpoint) {
			case 'sm': return services.slice(4); // Rest after first 4
			case 'md': return services.slice(5); // Rest after first 5
			case 'lg': return services.slice(6); // Rest after first 6
			case 'xl': return services.slice(7); // Rest after first 7
			default: return services.slice(5);
		}
	};

	const getDisplayedAction = (breakpoint) => {
		switch (breakpoint) {
			case 'sm': return actionItems.slice(0, 2);
			case 'md': return actionItems.slice(0, 2);
			case 'lg': return actionItems.slice(0, 2);
			case 'xl': return actionItems.slice(0, 2);
			default: return actionItems.slice(0, 2);
		}
	};

	const getMoreAction = (breakpoint) => {
		switch (breakpoint) {
			case 'sm': return actionItems.slice(2);
			case 'md': return actionItems.slice(2);
			case 'lg': return actionItems.slice(2);
			case 'xl': return actionItems.slice(2);
			default: return actionItems.slice(2);
		}
	};

	return (
		<div className="bg-[#E3F2FD] border-b border-gray-200 shadow-sm ">
			<div className="w-full px-2 sm:px-3 lg:px-6">
				{/* Mobile Layout (< 640px) */}
				<div className="sm:hidden pt-2">
					<div className="pb-2">
						<div className="grid grid-cols-3 gap-1">
							{mobileShowAllItems ? allItems.map((item, index) => (
								<a
									key={index}
									href={item.href}
									className="flex flex-col items-center text-center p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200"
									onClick={(e) => {
										if (item.hasAuthCheck && !isAuthenticated) {
											e.preventDefault();
											showAuthModal();
										} else if (item.name === 'Submit Publication' && isAdminAuthenticated) {
											e.preventDefault();
											alert('Admins should submit publications through the admin panel.');
										}
									}}
								>
									<Icon
										name={item.icon}
										size="xs"
										className="mb-1 text-gray-500 hover:text-blue-600 transition-colors"
									/>
									<span className="text-xs leading-tight truncate w-full">{item.name}</span>
								</a>
							)) : allItems.slice(0, 5).map((item, index) => (
								<a
									key={index}
									href={item.href}
									className="flex flex-col items-center text-center p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200"
									onClick={(e) => {
										if (item.hasAuthCheck && !isAuthenticated) {
											e.preventDefault();
											showAuthModal();
										} else if (item.name === 'Submit Publication' && isAdminAuthenticated) {
											e.preventDefault();
											alert('Admins should submit publications through the admin panel.');
										}
									}}
								>
									<Icon
										name={item.icon}
										size="xs"
										className="mb-1 text-gray-500 hover:text-blue-600 transition-colors"
									/>
									<span className="text-xs leading-tight truncate w-full">{item.name}</span>
								</a>
							))}
							{!mobileShowAllItems && allItems.length > 5 && (
								<button
									onClick={() => setMobileShowAllItems(true)}
									className="flex flex-col items-center text-center p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200"
								>
									<Icon
										name="menu"
										size="xs"
										className="mb-1 text-gray-500 hover:text-blue-600 transition-colors"
									/>
									<span className="text-xs leading-tight truncate w-full">More</span>
								</button>
							)}
						</div>
						{mobileShowAllItems && (
							<div className="text-center mt-2">
								<button
									onClick={() => setMobileShowAllItems(false)}
									className="text-xs text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors"
								>
									Show Less
								</button>
							</div>
						)}
					</div>
				</div>

				{/* Small Tablet Layout (640px - 768px) */}
				<div className="hidden sm:block md:hidden">
					<div className="py-1.5">
						<div className="flex items-center justify-center space-x-1 flex-wrap">
							{/* Resources Dropdown First */}
							<div className="group relative flex-shrink-0">
								<button className="flex items-center space-x-1 px-2 py-1.5 text-xs font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200 whitespace-nowrap">
									<Icon
										name="boxes"
										size="sm"
										className="text-gray-500 group-hover:text-blue-600 transition-colors"
									/>
									<span>Navigation</span>
									<Icon
										name="chevron-down"
										size="xs"
										className="text-gray-500 group-hover:text-blue-600 transition-colors"
									/>
								</button>

								{/* Responsive dropdown positioning */}
								<div className="absolute top-full right-0 mt-2 mr-4 w-52 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-30">
									<div className="p-2">
										<h4 className="text-sm font-semibold text-gray-900 mb-2">Navigation</h4>
										<div className="space-y-1">
											{menuItems.map((item, index) => (
												<a
													key={index}
													href={item.href}
													className="flex items-center space-x-2 px-2 py-1.5 text-xs text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200 w-full"
													onClick={(e) => {
														if (!isAuthenticated) {
															e.preventDefault();
															showAuthModal();
														}
													}}
												>
													<Icon
														name={item.icon}
														size="xs"
														className="text-gray-500 flex-shrink-0"
													/>
													<span className="text-left flex-1">{item.text}</span>
												</a>
											))}
										</div>
									</div>
								</div>
							</div>
							
							{/* Display Actions - Now shows 2 actions */}
							{getDisplayedAction('sm').map((action, index) => (
								<a
									key={`action-${index}`}
									href={action.href}
									className="flex-shrink-0 flex items-center space-x-1 px-2 py-1.5 text-xs font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200 group whitespace-nowrap"
									onClick={action.hasAuthCheck && !isAuthenticated ? (e) => { e.preventDefault(); showAuthModal(); } : action.name === 'Submit Publication' && isAdminAuthenticated ? (e) => { e.preventDefault(); alert('Admins should submit publications through the admin panel.'); } : undefined}
								>
									<Icon
										name={action.icon}
										size="sm"
										className="text-gray-500 group-hover:text-blue-600 transition-colors"
									/>
									<span>{action.name}</span>
								</a>
							))}

							{/* More Actions Dropdown */}
							{getMoreAction('sm').length > 0 && (
								<div className="group relative flex-shrink-0">
									<button className="flex items-center space-x-1 px-2 py-1.5 text-xs font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200 whitespace-nowrap">
										<Icon
											name="menu"
											size="sm"
											className="text-gray-500 group-hover:text-blue-600 transition-colors"
										/>
										<span>More ({getMoreAction('sm').length})</span>
									</button>

									{/* Responsive more dropdown */}
									<div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-30">
										<div className="p-2">
											<h4 className="text-sm font-semibold text-gray-900 mb-2">More Actions</h4>
											<div className="grid grid-cols-1 gap-1">
												{getMoreAction('sm').map((action, index) => (
													<a
														key={index}
														href={action.href}
														className="flex items-center space-x-2 px-2 py-1.5 text-xs text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200 w-full"
														onClick={action.hasAuthCheck && !isAuthenticated ? (e) => { e.preventDefault(); showAuthModal(); } : action.name === 'Submit Publication' && isAdminAuthenticated ? (e) => { e.preventDefault(); alert('Admins should submit publications through the admin panel.'); } : undefined}
													>
														<Icon
															name={action.icon}
															size="xs"
															className="text-gray-500 flex-shrink-0"
														/>
														<span className="text-left flex-1">{action.name}</span>
													</a>
												))}
											</div>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Tablet Layout (768px - 1024px) */}
				<div className="hidden md:block lg:hidden">
					<div className="py-2">
						<div className="flex items-center justify-center space-x-1.5 flex-wrap">
							{/* Resources Dropdown First */}
							<div className="group relative">
								<button className="flex items-center space-x-1.5 px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200 hover:shadow-md">
									<Icon
										name="boxes"
										size="sm"
										className="text-gray-500 group-hover:text-blue-600 transition-colors"
									/>
									<span>Navigation</span>
									<Icon
										name="chevron-down"
										size="xs"
										className="text-gray-500 group-hover:text-blue-600 transition-colors"
									/>
								</button>

								{/* Tablet responsive dropdown */}
								<div className="absolute top-full right-0 mt-2 mr-6 w-52 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-30">
									<div className="p-2">
										<h4 className="text-sm font-semibold text-gray-900 mb-2">Navigation</h4>
										<div className="space-y-1">
											{navigationItems.map((item, index) => (
												<a
													key={index}
													href={item.href}
													className="flex items-center space-x-2 px-2 py-1.5 text-xs text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200 w-full"
													onClick={(e) => {
														if (!isAuthenticated) {
															e.preventDefault();
															showAuthModal();
														}
													}}
												>
													<Icon
														name={item.icon}
														size="xs"
														className="text-gray-500 flex-shrink-0"
													/>
													<span className="text-left flex-1">{item.text}</span>
												</a>
											))}
										</div>
									</div>
								</div>
							</div>

							{/* Display Actions - Now shows 2 actions */}
							{getDisplayedAction('md').map((action, index) => (
								<a
									key={`action-${index}`}
									href={action.href}
									className="flex items-center space-x-1.5 px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200 hover:shadow-md group"
									onClick={action.hasAuthCheck && !isAuthenticated ? (e) => { e.preventDefault(); showAuthModal(); } : action.name === 'Submit Publication' && isAdminAuthenticated ? (e) => { e.preventDefault(); alert('Admins should submit publications through the admin panel.'); } : undefined}
								>
									<Icon
										name={action.icon}
										size="sm"
										className="text-gray-500 group-hover:text-blue-600 transition-colors"
									/>
									<span className="whitespace-nowrap">{action.name}</span>
								</a>
							))}

							{/* More Dropdown */}
							{getMoreAction('md').length > 0 && (
								<div className="group relative">
									<button className="flex items-center space-x-1.5 px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200 hover:shadow-md">
										<Icon
											name="menu"
											size="sm"
											className="text-gray-500 group-hover:text-blue-600 transition-colors"
										/>
										<span>More</span>
										<Icon
											name="chevron-down"
											size="xs"
											className="text-gray-500 group-hover:text-blue-600 transition-colors"
										/>
									</button>

									{/* Tablet more dropdown */}
									<div className="absolute top-full right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-30">
										<div className="p-2">
											<h4 className="text-sm font-semibold text-gray-900 mb-2">More Actions</h4>
											<div className="grid grid-cols-1 gap-1">
												{getMoreAction('md').map((action, index) => (
													<a
														key={index}
														href={action.href}
														className="flex items-center space-x-2 px-2 py-1.5 text-xs text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200"
														onClick={action.hasAuthCheck && !isAuthenticated ? (e) => { e.preventDefault(); showAuthModal(); } : action.name === 'Submit Publication' && isAdminAuthenticated ? (e) => { e.preventDefault(); alert('Admins should submit publications through the admin panel.'); } : undefined}
													>
														<Icon
															name={action.icon}
															size="xs"
															className="text-gray-500 flex-shrink-0"
														/>
														<span className="text-left flex-1">{action.name}</span>
													</a>
												))}
											</div>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Desktop Layout (>= 1024px) */}
				<div className="hidden lg:flex justify-center items-center py-1.5">
					<div className="flex items-center space-x-2 xl:space-x-3 2xl:space-x-4">
						{/* Navigation Links */}
						{navigationItems.map((item, index) => (
							<a
								key={`nav-${index}`}
								href={item.href}
								className="group relative flex items-center space-x-1.5 px-2.5 xl:px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200 hover:shadow-md"
								onClick={item.hasAuthCheck && !isAuthenticated ? (e) => { e.preventDefault(); showAuthModal(); } : undefined}
							>
								<Icon
									name={item.icon}
									size="sm"
									className="text-gray-500 group-hover:text-blue-600 transition-colors"
								/>
								<span className="whitespace-nowrap">{item.text}</span>
							</a>
						))}

						{/* Action Buttons */}
						{actionItems.map((item, index) => (
							item.isLink ? (
								<Link
									key={`action-${index}`}
									to={item.href}
									className="group relative flex items-center space-x-1.5 px-2.5 xl:px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200 hover:shadow-md"
								>
									<Icon
										name={item.icon}
										size="sm"
										className="text-gray-500 group-hover:text-blue-600 transition-colors"
									/>
									<span className="whitespace-nowrap">{item.name}</span>
								</Link>
							) : (
								<button
									key={`action-${index}`}
									onClick={item.name === 'Submit Publication' ? (isAdminAuthenticated ? () => alert('Admins should submit publications through the admin panel.') : showAuthModal) : showAuthModal}
									className="group relative flex items-center space-x-1.5 px-2.5 xl:px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200 hover:shadow-md"
								>
									<Icon
										name={item.icon}
										size="sm"
										className="text-gray-500 group-hover:text-blue-600 transition-colors"
									/>
									<span className="whitespace-nowrap">{item.name}</span>
								</button>
							)
						))}
					</div>
				</div>

				{/* Subtle Animation Bar */}
				<div className="h-0.5 bg-[#E3F2FD] opacity-20"></div>
			</div>

		</div>
	);
};

export default TopHeader;
