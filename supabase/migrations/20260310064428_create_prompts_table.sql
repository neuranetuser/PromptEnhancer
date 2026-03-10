/*
  # Create prompts history table

  1. New Tables
    - `prompts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `original_prompt` (text, the user's input prompt)
      - `enhanced_prompt` (text, the AI-generated enhanced prompt)
      - `model_type` (text, which model was used: '7B', '32B', 'GGUF', 'Img2Img')
      - `temperature` (float, generation parameter)
      - `created_at` (timestamp)
      
  2. Security
    - Enable RLS on `prompts` table
    - Add policy for authenticated users to read their own prompts
    - Add policy for authenticated users to insert their own prompts
    - Add policy for authenticated users to delete their own prompts
*/

CREATE TABLE IF NOT EXISTS prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  original_prompt text NOT NULL,
  enhanced_prompt text NOT NULL,
  model_type text DEFAULT '7B' NOT NULL,
  temperature float DEFAULT 0.7,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prompts"
  ON prompts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own prompts"
  ON prompts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own prompts"
  ON prompts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS prompts_user_id_idx ON prompts(user_id);
CREATE INDEX IF NOT EXISTS prompts_created_at_idx ON prompts(created_at DESC);
