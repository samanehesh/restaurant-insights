DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_id_auth_users_id_fk'
  ) THEN
    ALTER TABLE "profiles"
    ADD CONSTRAINT "profiles_id_auth_users_id_fk"
    FOREIGN KEY ("id")
    REFERENCES "auth"."users"("id")
    ON DELETE cascade
    ON UPDATE no action;
  END IF;
END
$$;