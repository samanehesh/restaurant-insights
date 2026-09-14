CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  profile_name text;
  profile_locale text;
BEGIN
  profile_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data ->> 'full_name'), ''),
    SPLIT_PART(NEW.email, '@', 1),
    'User'
  );

  profile_locale := CASE
    WHEN NEW.raw_user_meta_data ->> 'preferred_locale' IN ('en', 'fr')
      THEN NEW.raw_user_meta_data ->> 'preferred_locale'
    ELSE 'en'
  END;

  INSERT INTO public.profiles (
    id,
    full_name,
    preferred_locale
  )
  VALUES (
    NEW.id,
    LEFT(profile_name, 150),
    profile_locale
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();