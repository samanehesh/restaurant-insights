import { signOut } from "../actions/sign-out";

type SignOutButtonProps = {
  label: string;
  locale: string;
};

export function SignOutButton({
  label,
  locale,
}: SignOutButtonProps) {
  return (
    <form action={signOut}>
      <input name="locale" type="hidden" value={locale} />

      <button
        className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
        type="submit"
      >
        {label}
      </button>
    </form>
  );
}