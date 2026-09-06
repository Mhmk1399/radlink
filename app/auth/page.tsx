import AuthPage from "@/components/static/auth/AuthPage";

type AuthRouteProps = {
  searchParams?: Promise<{ returnTo?: string | string[] }>;
};

const getReturnTo = async (searchParams?: AuthRouteProps["searchParams"]) => {
  const params = await searchParams;
  const value = Array.isArray(params?.returnTo)
    ? params?.returnTo[0]
    : params?.returnTo;
  return typeof value === "string" ? value : "";
};

const page = async ({ searchParams }: AuthRouteProps) => {
  const returnTo = await getReturnTo(searchParams);

  return (
    <div>
      <AuthPage initialReturnTo={returnTo} />
    </div>
  );
};

export default page;
