import React, { useState } from 'react';
import Icon from './Icon';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../auth/AuthModal';

const TopHeader = () => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
	const [mobileShowAllItems, setMobileShowAllItems] = useState(false);
	const { isAuthenticated } = useAuth();

	const menuItems = [
		{
			href: "#video-tutorial",
			text: "Video Tutorial",
			icon: "play-circle",
			description: "Learn how to use our platform effectively"
		},
		{
			href: "#download-pr-questionnaire",
			text: "PR Questionnaire",
			icon: "document",
			description: "Download our comprehensive PR template"
		},
		{
			href: "#how-to-guide",
			text: "How-to Guide",
			icon: "question-mark-circle",
			description: "Step-by-step platform instructions"
		},
		{
			href: "/terms-and-conditions",
			text: "Terms & Policies",
			icon: "shield-check",
			description: "Legal information and platform policies"
		},
		{
			href: "#published-articles-press-releases",
			text: "Published Articles and Press Releases",
			icon: "newspaper",
			description: "Browse published articles and press releases"
		},
		{
			href: "#published-work-testimony",
			text: "Published Work/Testimony",
			icon: "document-text",
			description: "View published work and testimonies"
		}
	];

	const services = [
		{ name: 'Submit Article', href: '#submit-article', icon: 'document-text' },
		{ name: 'Publications', href: '#publications', icon: 'newspaper' },
		{ name: 'Websites', href: '#websites', icon: 'globe-alt' },
		{ name: 'Radio', href: '#radio', icon: 'microphone' },
		{ name: 'Paparazzi', href: '#paparazzi', icon: 'camera' }, // Move to position 4 (index 4)
		{ name: 'Power List', href: '#power-list', icon: 'chart-bar' }, // Move to position 5 (index 5)
		{ name: 'Theme Pages', href: '#theme-pages', icon: 'tag' },
		{ name: 'Awards', href: '#awards', icon: 'award' },
		{ name: 'Events', href: '#events-awards', icon: 'calendar' },
		{ name: 'Press Release', href: '#press-release', icon: 'megaphone' },
		{ name: 'Podcasters', href: '#podcasters', icon: 'microphone' },
		{ name: 'Real Estate', href: '#real-estate', icon: 'home' }
	];

	const allItems = [
		...menuItems.map(item => ({ name: item.text, href: item.href, icon: item.icon })),
		...services
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
										if (!isAuthenticated) {
											e.preventDefault();
											setIsAuthModalOpen(true);
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
										if (!isAuthenticated) {
											e.preventDefault();
											setIsAuthModalOpen(true);
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
									<span>Resources</span>
									<Icon
										name="chevron-down"
										size="xs"
										className="text-gray-500 group-hover:text-blue-600 transition-colors"
									/>
								</button>

								{/* Responsive dropdown positioning */}
								<div className="absolute top-full right-0 mt-2 mr-4 w-52 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-30">
									<div className="p-2">
										<h4 className="text-sm font-semibold text-gray-900 mb-2">Resource Center</h4>
										<div className="space-y-1">
											{menuItems.map((item, index) => (
												<a
													key={index}
													href={item.href}
													className="flex items-center space-x-2 px-2 py-1.5 text-xs text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200 w-full"
													onClick={(e) => {
														if (!isAuthenticated) {
															e.preventDefault();
															setIsAuthModalOpen(true);
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
							
							{/* Display Services - Now shows 4 including Paparazzi */}
							{getDisplayedServices('sm').map((service, index) => (
								<a
									key={`service-${index}`}
									href={service.href}
									className="flex-shrink-0 flex items-center space-x-1 px-2 py-1.5 text-xs font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200 group whitespace-nowrap"
									onClick={(e) => {
										if (!isAuthenticated) {
											e.preventDefault();
											setIsAuthModalOpen(true);
										}
									}}
								>
									<Icon
										name={service.icon}
										size="sm"
										className="text-gray-500 group-hover:text-blue-600 transition-colors"
									/>
									<span>{service.name}</span>
								</a>
							))}

							{/* More Services Dropdown */}
							{getMoreServices('sm').length > 0 && (
								<div className="group relative flex-shrink-0">
									<button className="flex items-center space-x-1 px-2 py-1.5 text-xs font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200 whitespace-nowrap">
										<Icon
											name="menu"
											size="sm"
											className="text-gray-500 group-hover:text-blue-600 transition-colors"
										/>
										<span>More ({getMoreServices('sm').length})</span>
									</button>

									{/* Responsive more dropdown */}
									<div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-30">
										<div className="p-2">
											<h4 className="text-sm font-semibold text-gray-900 mb-2">More Services</h4>
											<div className="grid grid-cols-1 gap-1">
												{getMoreServices('sm').map((service, index) => (
													<a
														key={index}
														href={service.href}
														className="flex items-center space-x-2 px-2 py-1.5 text-xs text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200 w-full"
														onClick={(e) => {
															if (!isAuthenticated) {
																e.preventDefault();
																setIsAuthModalOpen(true);
															}
														}}
													>
														<Icon
															name={service.icon}
															size="xs"
															className="text-gray-500 flex-shrink-0"
														/>
														<span className="text-left flex-1">{service.name}</span>
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
									<span>Resources</span>
									<Icon
										name="chevron-down"
										size="xs"
										className="text-gray-500 group-hover:text-blue-600 transition-colors"
									/>
								</button>

								{/* Tablet responsive dropdown */}
								<div className="absolute top-full right-0 mt-2 mr-6 w-52 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-30">
									<div className="p-2">
										<h4 className="text-sm font-semibold text-gray-900 mb-2">Resource Center</h4>
										<div className="space-y-1">
											{menuItems.map((item, index) => (
												<a
													key={index}
													href={item.href}
													className="flex items-center space-x-2 px-2 py-1.5 text-xs text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200 w-full"
													onClick={(e) => {
														if (!isAuthenticated) {
															e.preventDefault();
															setIsAuthModalOpen(true);
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

							{/* Display Services - Now shows 5 including Power List */}
							{getDisplayedServices('md').map((service, index) => (
								<a
									key={`service-${index}`}
									href={service.href}
									className="flex items-center space-x-1.5 px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200 hover:shadow-md group"
									onClick={(e) => {
										if (!isAuthenticated) {
											e.preventDefault();
											setIsAuthModalOpen(true);
										}
									}}
								>
									<Icon
										name={service.icon}
										size="sm"
										className="text-gray-500 group-hover:text-blue-600 transition-colors"
									/>
									<span className="whitespace-nowrap">{service.name}</span>
								</a>
							))}

							{/* More Dropdown */}
							{getMoreServices('md').length > 0 && (
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
											<h4 className="text-sm font-semibold text-gray-900 mb-2">More Services</h4>
											<div className="grid grid-cols-1 gap-1">
												{getMoreServices('md').map((service, index) => (
													<a
														key={index}
														href={service.href}
														className="flex items-center space-x-2 px-2 py-1.5 text-xs text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200"
														onClick={(e) => {
															if (!isAuthenticated) {
																e.preventDefault();
																setIsAuthModalOpen(true);
															}
														}}
													>
														<Icon
															name={service.icon}
															size="xs"
															className="text-gray-500 flex-shrink-0"
														/>
														<span className="text-left flex-1">{service.name}</span>
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
						{/* Resources Dropdown */}
						<div className="group relative">
							<button className="group relative flex items-center space-x-1.5 px-2.5 xl:px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200 hover:shadow-md">
								<Icon
									name="boxes"
									size="sm"
									className="text-gray-500 group-hover:text-blue-600 transition-colors"
								/>
								<span className="whitespace-nowrap">Resources</span>
								<Icon
									name="chevron-down"
									size="xs"
									className="text-gray-500 group-hover:text-blue-600 transition-colors"
								/>
							</button>

							<div className="absolute top-full left-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-30">
								<div className="p-4">
									<h4 className="text-sm font-semibold text-gray-900 mb-3">Resource Center</h4>
									<div className="grid grid-cols-1 gap-2">
										{menuItems.map((item, index) => (
											<a
												key={index}
												href={item.href}
												className="flex items-center space-x-2 px-3 py-3 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200"
												onClick={(e) => {
													if (!isAuthenticated) {
														e.preventDefault();
														setIsAuthModalOpen(true);
													}
												}}
											>
												<Icon
													name={item.icon}
													size="sm"
													className="text-gray-500 flex-shrink-0"
												/>
												<div>
													<div className="font-medium">{item.text}</div>
													<div className="text-xs text-gray-500 mt-1">{item.description}</div>
												</div>
											</a>
										))}
									</div>
								</div>
							</div>
						</div>

						{/* Main Services - Now shows 6-7 services including both Paparazzi and Power List */}
						{getDisplayedServices(window.innerWidth >= 1280 ? 'xl' : 'lg').map((service, index) => (
							<a
								key={`service-${index}`}
								href={service.href}
								className="group relative flex items-center space-x-1.5 px-2.5 xl:px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200 hover:shadow-md"
								onClick={(e) => {
									if (!isAuthenticated) {
										e.preventDefault();
										setIsAuthModalOpen(true);
									}
								}}
							>
								<Icon
									name={service.icon}
									size="sm"
									className="text-gray-500 group-hover:text-blue-600 transition-colors"
								/>
								<span className="whitespace-nowrap">{service.name}</span>
							</a>
						))}

						{/* More Dropdown */}
						{getMoreServices(window.innerWidth >= 1280 ? 'xl' : 'lg').length > 0 && (
							<div className="group relative">
								<button className="group relative flex items-center space-x-1.5 px-2.5 xl:px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200 hover:shadow-md">
									<Icon
										name="menu"
										size="sm"
										className="text-gray-500 group-hover:text-blue-600 transition-colors"
									/>
									<span className="whitespace-nowrap">More</span>
									<Icon
										name="chevron-down"
										size="xs"
										className="text-gray-500 group-hover:text-blue-600 transition-colors"
									/>
								</button>

								<div className="absolute top-full right-0 mt-2 w-60 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-30">
									<div className="p-3">
										<h4 className="text-sm font-semibold text-gray-900 mb-3">Additional Services</h4>
										<div className="grid grid-cols-1 gap-2">
											{getMoreServices(window.innerWidth >= 1280 ? 'xl' : 'lg').map((service, index) => (
												<a
													key={index}
													href={service.href}
													className="flex items-center space-x-2 px-3 py-2.5 text-xs text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200"
													onClick={(e) => {
														if (!isAuthenticated) {
															e.preventDefault();
															setIsAuthModalOpen(true);
														}
													}}
												>
													<Icon
														name={service.icon}
														size="xs"
														className="text-gray-500 flex-shrink-0"
													/>
													<span className="text-left flex-1">{service.name}</span>
												</a>
											))}
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Subtle Animation Bar */}
				<div className="h-0.5 bg-[#E3F2FD] opacity-20"></div>
			</div>

			{/* Auth Modal */}
			<AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
		</div>
	);
};

export default TopHeader;
