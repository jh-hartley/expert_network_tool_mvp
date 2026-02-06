/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  /* Exclude xlsx (SheetJS) from server-side bundling -- it uses Node
     globals that break during static prerendering. The library is only
     used client-side via dynamic import(). */
  serverExternalPackages: ["xlsx"],
}

export default nextConfig
