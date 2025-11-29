import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import { useAuth } from '../../context/AuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useAuthModal } from '../../App';
import useTranslatedText from '../../hooks/useTranslatedText';

const TopHeader = () => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [mobileShowAllItems, setMobileShowAllItems] = useState(false);
	const { isAuthenticated } = useAuth();
	const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();
	const { showAuthModal } = useAuthModal();

	// Translated strings
	const agencyRegistration = useTranslatedText('Agency Registration');
	const editorRegistration = useTranslatedText('Editor Registration');
	const reporterRegistration = useTranslatedText('Reporter Registration');
	const submitPublication = useTranslatedText('Submit Publication');
	const themePages = useTranslatedText('Theme Pages');
	const events = useTranslatedText('Events');
	const pressRelease = useTranslatedText('Press Release');
	const podcasters = useTranslatedText('Podcasters');
	const more = useTranslatedText('More');
	const showLess = useTranslatedText('Show Less');
	const moreActions = useTranslatedText('More Actions');
	const adminAlert = useTranslatedText('Admins should submit publications through the admin panel.');

	const actionItems = [
		{ name: 'Agency Registration', displayName: agencyRegistration, href: '/agency-registration', icon: 'user-group', color: '#4CAF50', isLink: true, hasAuthCheck: false },
		{ name: 'Editor Registration', displayName: editorRegistration, href: '#', icon: 'user', color: '#1976D2', isLink: false, hasAuthCheck: true },
		{ name: 'Reporter Registration', displayName: reporterRegistration, href: '/reporter-registration', icon: 'user-plus', color: '#FF5722', isLink: true, hasAuthCheck: false },
		{ name: 'Submit Publication', displayName: submitPublication, href: '#', icon: 'document-plus', color: '#9C27B0', isLink: false, hasAuthCheck: true },
		{ name: 'Theme Pages', displayName: themePages, href: '/themes', icon: 'tag', color: '#FF9800', isLink: true, hasAuthCheck: false },
		{ name: 'Events', displayName: events, href: '/events', icon: 'calendar', color: '#2196F3', isLink: true, hasAuthCheck: false },
		{ name: 'Press Release', displayName: pressRelease, href: '/press-packs', icon: 'megaphone', color: '#4CAF50', isLink: true, hasAuthCheck: false },
		{ name: 'Podcasters', displayName: podcasters, href: '/podcasters', icon: 'microphone', color: '#9C27B0', isLink: true, hasAuthCheck: false }
	];



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
							{mobileShowAllItems ? actionItems.map((item, index) => (
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
											alert(adminAlert);
										}
									}}
								>
									<Icon
										name={item.icon}
										size="xs"
										className="mb-1 text-gray-500 hover:text-blue-600 transition-colors"
									/>
									<span className="text-xs leading-tight truncate w-full">{item.displayName}</span>
								</a>
							)) : actionItems.slice(0, 5).map((item, index) => (
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
											alert(adminAlert);
										}
									}}
								>
									<Icon
										name={item.icon}
										size="xs"
										className="mb-1 text-gray-500 hover:text-blue-600 transition-colors"
									/>
									<span className="text-xs leading-tight truncate w-full">{item.displayName}</span>
								</a>
							))}
							{!mobileShowAllItems && actionItems.length > 5 && (
								<button
									onClick={() => setMobileShowAllItems(true)}
									className="flex flex-col items-center text-center p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200"
								>
									<Icon
										name="menu"
										size="xs"
										className="mb-1 text-gray-500 hover:text-blue-600 transition-colors"
									/>
									<span className="text-xs leading-tight truncate w-full">{more}</span>
								</button>
							)}
						</div>
						{mobileShowAllItems && (
							<div className="text-center mt-2">
								<button
									onClick={() => setMobileShowAllItems(false)}
									className="text-xs text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors"
								>
									{showLess}
								</button>
							</div>
						)}
					</div>
				</div>

				{/* Small Tablet Layout (640px - 768px) */}
				<div className="hidden sm:block md:hidden">
					<div className="py-1.5">
						<div className="flex items-center justify-center space-x-1 flex-wrap">
							{/* Display Actions - Now shows 2 actions */}
							{getDisplayedAction('sm').map((action, index) => (
								<a
									key={`action-${index}`}
									href={action.href}
									className="flex-shrink-0 flex items-center space-x-1 px-2 py-1.5 text-xs font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200 group whitespace-nowrap"
									onClick={action.hasAuthCheck && !isAuthenticated ? (e) => { e.preventDefault(); showAuthModal(); } : action.name === 'Submit Publication' && isAdminAuthenticated ? (e) => { e.preventDefault(); alert(adminAlert); } : undefined}
								>
									<Icon
										name={action.icon}
										size="sm"
										className="text-gray-500 group-hover:text-blue-600 transition-colors"
									/>
									<span>{action.displayName}</span>
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
										<span>{more} ({getMoreAction('sm').length})</span>
									</button>

									{/* Responsive more dropdown */}
									<div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-30">
										<div className="p-2">
											<h4 className="text-sm font-semibold text-gray-900 mb-2">{moreActions}</h4>
											<div className="grid grid-cols-1 gap-1">
												{getMoreAction('sm').map((action, index) => (
													<a
														key={index}
														href={action.href}
														className="flex items-center space-x-2 px-2 py-1.5 text-xs text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200 w-full"
														onClick={action.hasAuthCheck && !isAuthenticated ? (e) => { e.preventDefault(); showAuthModal(); } : action.name === 'Submit Publication' && isAdminAuthenticated ? (e) => { e.preventDefault(); alert(adminAlert); } : undefined}
													>
														<Icon
															name={action.icon}
															size="xs"
															className="text-gray-500 flex-shrink-0"
														/>
														<span className="text-left flex-1">{action.displayName}</span>
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
							{/* Display Actions - Now shows 2 actions */}
							{getDisplayedAction('md').map((action, index) => (
								<a
									key={`action-${index}`}
									href={action.href}
									className="flex items-center space-x-1.5 px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200 hover:shadow-md group"
									onClick={action.hasAuthCheck && !isAuthenticated ? (e) => { e.preventDefault(); showAuthModal(); } : action.name === 'Submit Publication' && isAdminAuthenticated ? (e) => { e.preventDefault(); alert(adminAlert); } : undefined}
								>
									<Icon
										name={action.icon}
										size="sm"
										className="text-gray-500 group-hover:text-blue-600 transition-colors"
									/>
									<span className="whitespace-nowrap">{action.displayName}</span>
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
										<span>{more}</span>
										<Icon
											name="chevron-down"
											size="xs"
											className="text-gray-500 group-hover:text-blue-600 transition-colors"
										/>
									</button>

									{/* Tablet more dropdown */}
									<div className="absolute top-full right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-30">
										<div className="p-2">
											<h4 className="text-sm font-semibold text-gray-900 mb-2">{moreActions}</h4>
											<div className="grid grid-cols-1 gap-1">
												{getMoreAction('md').map((action, index) => (
													<a
														key={index}
														href={action.href}
														className="flex items-center space-x-2 px-2 py-1.5 text-xs text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200"
														onClick={action.hasAuthCheck && !isAuthenticated ? (e) => { e.preventDefault(); showAuthModal(); } : action.name === 'Submit Publication' && isAdminAuthenticated ? (e) => { e.preventDefault(); alert(adminAlert); } : undefined}
													>
														<Icon
															name={action.icon}
															size="xs"
															className="text-gray-500 flex-shrink-0"
														/>
														<span className="text-left flex-1">{action.displayName}</span>
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
									<span className="whitespace-nowrap">{item.displayName}</span>
								</Link>
							) : (
								<button
									key={`action-${index}`}
									onClick={item.name === 'Submit Publication' ? (isAdminAuthenticated ? () => alert(adminAlert) : showAuthModal) : showAuthModal}
									className="group relative flex items-center space-x-1.5 px-2.5 xl:px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200 hover:shadow-md"
								>
									<Icon
										name={item.icon}
										size="sm"
										className="text-gray-500 group-hover:text-blue-600 transition-colors"
									/>
									<span className="whitespace-nowrap">{item.displayName}</span>
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
