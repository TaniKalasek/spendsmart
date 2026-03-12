import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://gycoktqrvkkimpbjtniw.supabase.co'
const SUPABASE_ANON = 'sb_publishable_Db6PqAuLA3dG9j-Js16dtw_NLcIGe59'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
