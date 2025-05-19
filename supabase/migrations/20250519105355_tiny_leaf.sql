/*
  # Create places table

  1. New Tables
    - `places`
      - `id` (uuid, primary key)
      - `name` (text)
      - `address` (text)
      - `user_id` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS on `places` table
    - Add policy for authenticated users to read their own data
*/

CREATE TABLE IF NOT EXISTS "places" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "address" text NOT NULL,
  "user_id" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "places" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own places"
  ON places
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);