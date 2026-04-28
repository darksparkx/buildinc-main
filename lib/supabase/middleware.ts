// lib/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Paths that must work without a logged-in session (marketing + legal). */
const PUBLIC_PATHS = new Set([
	"/privacy",
	"/terms",
	"/cookies",
]);

export async function updateSession(request: NextRequest) {
	let supabaseResponse = NextResponse.next({
		request,
	});

	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
	if (!supabaseUrl?.trim() || !supabaseAnonKey?.trim()) {
		console.error(
			"[middleware] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
		);
		return supabaseResponse;
	}

	const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			getAll() {
				return request.cookies.getAll();
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value }) =>
					request.cookies.set(name, value)
				);
				supabaseResponse = NextResponse.next({
					request,
				});
				cookiesToSet.forEach(({ name, value, options }) =>
					supabaseResponse.cookies.set(name, value, options)
				);
			},
		},
	});

	let user = null;
	try {
		const {
			data: { user: u },
		} = await supabase.auth.getUser();
		user = u;
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		console.error(
			"[middleware] Supabase auth request failed (fetch). Check that NEXT_PUBLIC_SUPABASE_URL matches your project (Dashboard → Settings → API), the project is not paused, and DNS/network can reach *.supabase.co:",
			msg
		);
	}

	const pathname = request.nextUrl.pathname;
	const isPublicPath =
		pathname === "/" ||
		pathname.startsWith("/login") ||
		pathname.startsWith("/auth") ||
		pathname.startsWith("/api/payment/webhook") ||
		PUBLIC_PATHS.has(pathname);

	if (!isPublicPath && !user) {
		// no user, potentially respond by redirecting the user to the login page
		const url = request.nextUrl.clone();
		url.pathname = "/auth/login";
		return NextResponse.redirect(url);
	}

	return supabaseResponse;
}
