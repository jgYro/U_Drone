import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("about", "routes/about.tsx"),
  route("api-demo", "routes/api-demo.tsx"),
  route("data", "routes/data.tsx"),
] satisfies RouteConfig;
