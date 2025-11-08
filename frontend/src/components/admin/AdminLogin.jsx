import React, { useState } from "react";
import { useNavigate, Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

// Replace react-icons with small inline SVGs to avoid missing dependency
const IconUser = ({ size = 18, color = "#1976D2", ariaHidden = true }) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden={ariaHidden} xmlns="http://www.w3.org/2000/svg">
		<path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" fill={color}/>
		<path d="M3 20c0-3.866 3.582-7 9-7s9 3.134 9 7v1H3v-1z" fill={color}/>
	</svg>
);
const IconLock = ({ size = 18, color = "#1976D2", ariaHidden = true }) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden={ariaHidden} xmlns="http://www.w3.org/2000/svg">
		<rect x="3" y="11" width="18" height="10" rx="2" fill={color}/>
		<path d="M7 11V8a5 5 0 0110 0v3" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
	</svg>
);
const IconLogin = ({ size = 18, color = "#fff", ariaHidden = true }) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden={ariaHidden} xmlns="http://www.w3.org/2000/svg">
		<path d="M15 3l6 6-6 6" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
		<path d="M21 9H9a3 3 0 00-3 3v0a3 3 0 003 3h12" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
	</svg>
);

export default function AdminLogin({ onLogin }) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const { login, isAuthenticated } = useAdminAuth();
	const navigate = useNavigate();

	// Redirect if already authenticated
	if (isAuthenticated) {
		return <Navigate to="/admin/dashboard" replace />;
	}

	// Color palette from brand guidelines (frontend/Website_Workflow/Color palette .pdf)
	const theme = {
		primary: "#1976D2", // Primary Blue from brand palette
		primaryDark: "#0D47A1", // Primary Dark from brand palette
		accent: "#F44336", // Error Red from brand palette
		success: "#4CAF50", // Success Green from brand palette
		warning: "#FF9800", // Warning Orange from brand palette
		info: "#9C27B0", // Info Purple from brand palette
		textPrimary: "#212121", // Text Primary from brand palette
		textSecondary: "#757575", // Text Secondary from brand palette
		textDisabled: "#BDBDBD", // Text Disabled from brand palette
		background: "#FFFFFF", // Background from brand palette
		backgroundAlt: "#FAFAFA", // Background Alt from brand palette
		backgroundSoft: "#F5F5F5", // Background Soft from brand palette
		borderLight: "#E0E0E0", // Border Light from brand palette
		borderMedium: "#BDBDBD", // Border Medium from brand palette
		fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"
	};

	const styles = {
		page: {
			minHeight: "100vh",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			background: theme.backgroundSoft,
			fontFamily: theme.fontFamily,
			color: theme.textPrimary,
			padding: 20
		},
		card: {
			width: "100%",
			maxWidth: 420,
			background: theme.card,
			borderRadius: 12,
			boxShadow: "0 8px 30px rgba(16,24,40,0.08)",
			padding: "28px",
			border: `1px solid rgba(16,24,40,0.04)`
		},
		header: {
			display: "flex",
			alignItems: "center",
			gap: 12,
			marginBottom: 18
		},
		logoCircle: {
			width: 56,
			height: 56,
			borderRadius: 12,
			background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`,
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			color: "#fff",
			fontSize: 22,
			fontWeight: 700,
			boxShadow: `0 6px 18px rgba(25,118,210,0.18)`
		},
		title: {
			fontSize: 18,
			fontWeight: 700,
			lineHeight: 1,
			margin: 0
		},
		sub: {
			fontSize: 13,
			color: theme.textSecondary,
			marginTop: 4
		},
		form: {
			marginTop: 6,
			display: "grid",
			gap: 12
		},
		field: {
			display: "flex",
			alignItems: "center",
			gap: 10,
			background: theme.backgroundAlt,
			padding: "10px 12px",
			borderRadius: 10,
			border: `1px solid ${theme.borderLight}`,
			transition: "box-shadow .12s, border-color .12s"
		},
		input: {
			flex: 1,
			border: "none",
			outline: "none",
			background: "transparent",
			fontSize: 14,
			color: theme.textPrimary,
			fontFamily: "inherit"
		},
		button: {
			marginTop: 6,
			width: "100%",
			padding: "12px 14px",
			borderRadius: 10,
			border: "none",
			cursor: "pointer",
			background: theme.primary,
			color: "#fff",
			fontWeight: 600,
			display: "inline-flex",
			alignItems: "center",
			justifyContent: "center",
			gap: 8,
			fontFamily: "inherit",
			boxShadow: `0 6px 18px rgba(25,118,210,0.14)`
		},
		error: {
			color: theme.accent,
			fontSize: 13,
			marginTop: 6,
			backgroundColor: "#FEE2E2",
			border: `1px solid ${theme.accent}`,
			borderRadius: 6,
			padding: "8px 12px"
		},
		footerNote: {
			marginTop: 12,
			fontSize: 12,
			color: theme.textSecondary,
			textAlign: "center"
		}
	};

	// minimal validation
	const handleSubmit = async (e) => {
		e?.preventDefault();
		setError("");
		if (!email.trim() || !password) {
			setError("Please enter both email and password.");
			return;
		}
		// Simple email pattern check
		const emailPattern = /\S+@\S+\.\S+/;
		if (!emailPattern.test(email)) {
			setError("Please enter a valid email address.");
			return;
		}
		setLoading(true);
		// Hook for parent to handle actual auth
		try {
			await login(email, password);
			navigate('/admin/dashboard');
		} catch (error) {
			setError(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div style={styles.page}>
			<form style={styles.card} onSubmit={handleSubmit} noValidate aria-labelledby="admin-login-title">
				<div style={styles.header}>
					<div style={styles.logoCircle} aria-hidden>
						A
					</div>
					<div>
						<h1 id="admin-login-title" style={styles.title}>Admin Sign in</h1>
						<div style={styles.sub}>Secure access to the News MarketPlace admin panel</div>
					</div>
				</div>

				{/* form fields */}
				<div style={styles.form}>
					<label style={{ display: "block" }}>
						<div style={{ fontSize: 12, marginBottom: 6, color: theme.textSecondary }}>Email</div>
						<div
							style={styles.field}
							onFocus={(ev) => (ev.currentTarget.style.border = `1px solid ${theme.primary}`)}
							onBlur={(ev) => (ev.currentTarget.style.border = "1px solid transparent")}
						>
							<IconUser style={{ minWidth: 18 }} aria-hidden />
							<input
								style={styles.input}
								type="email"
								placeholder="you@company.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								aria-required="true"
								aria-label="Email"
							/>
						</div>
					</label>

					<label style={{ display: "block" }}>
						<div style={{ fontSize: 12, marginBottom: 6, color: theme.textSecondary }}>Password</div>
						<div
							style={styles.field}
							onFocus={(ev) => (ev.currentTarget.style.border = `1px solid ${theme.primary}`)}
							onBlur={(ev) => (ev.currentTarget.style.border = "1px solid transparent")}
						>
							<IconLock style={{ minWidth: 18 }} aria-hidden />
							<input
								style={styles.input}
								type={showPassword ? "text" : "password"}
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								aria-required="true"
								aria-label="Password"
							/>
							<button
								type="button"
								className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
								onClick={() => setShowPassword(!showPassword)}
								disabled={loading}
							>
								{showPassword ? (
									<svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
									</svg>
								) : (
									<svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
									</svg>
								)}
							</button>
						</div>
					</label>

					{error && <div role="alert" style={styles.error}>{error}</div>}

					<button type="submit" style={styles.button} aria-label="Sign in">
						<IconLogin size={18} aria-hidden />
						<span>{loading ? "Signing in..." : "Sign in"}</span>
					</button>
				</div>

				<div style={styles.footerNote}>
					<span>Use your admin credentials. Contact the site owner for access.</span>
				</div>
			</form>
		</div>
	);
}