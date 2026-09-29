import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return Response.json({ error: 'Supabase credentials are missing' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const genAI = new GoogleGenerativeAI(geminiKey);

    const { inputProfile } = await req.json();

    if (!inputProfile) {
      return Response.json({ error: 'Profile text is required' }, { status: 400 });
    }

    const { data: databaseProfiles, error } = await supabase
      .from('profiles db')
      .select('*');

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
    You are an expert AI Matchmaking Engine for 'Nikah Connect' (https://www.nikahconnect.pro).

    INCOMING CLIENT PROFILE (Text received from WhatsApp):
    """
    ${inputProfile}
    """

    DATABASE OF PROFILES TO EVALUATE:
    ${JSON.stringify(databaseProfiles)}

    CRITICAL RULES FOR MATCHING:
    1. GENDER RULE: Male matches ONLY with Female, Female matches ONLY with Male.
    2. AGE RULE: The Male must be EQUAL TO OR OLDER than the Female. If Female is older than Male, STRICTLY DISQUALIFY (Match Score = 0%).
    3. LOCATION RULE: 
       - Direct city matches get highest score.
       - If exact city match is unavailable, match with nearby surrounding cities in Pakistan (e.g. Lahore <-> Sheikhupura/Kasur/Gujranwala/Okara, Rawalpindi <-> Islamabad). Give a reasonable match score (60%-80%) for nearby cities.
    4. EVALUATION: Compare Sect/Maslak, Caste preferences, Education, Financial Status, and Requirements.

    OUTPUT INSTRUCTIONS:
    Select up to TOP 10 best matching profiles (minimum match score 50%).
    Return a valid JSON array of objects with the following properties ONLY:
    [
      {
        "profile_id": "NC-XXX",
        "match_percentage": 85,
        "match_reason": "Brief 1-sentence reason why this profile matched",
        "formatted_text": "Paste the candidate details strictly in the exact Nikah Connect WhatsApp output template provided below"
      }
    ]

    EXACT OUTPUT FORMAT FOR 'formatted_text':
    Gender/age/city/Martial status/caste

    https://www.nikahconnect.pro

    🔵 *Candidate Info* 

    👉>-Gender: [Gender]
    👉>-Marital status: [Marital Status]
    👉>-Date of birth: [Age / DOB]
    👉>-Height: [Height]
    👉>-weight: [Weight]
    👉>-Complexion: [Complexion]
    👉>-Education: [Education]
    👉>-College/University: [College/University]
    👉>-Religious education(optional): [Religious Education]
    👉>-Monthly Income: [Income]
    👉>-Source of income: [Source]
    👉>-Sect (Maslak) : [Sect]
    👉>-Caste : [Caste]
    👉>-Beard/Hijab: [Hijab/Beard]
    👉>-Language: [Language]
    👉>-Disability : [Disability]

    🔵 *Family Status* 

    👉>-Father’s Profession: [Father Job]
    👉>-Mother profession: [Mother Job]

    🔵>- *Siblings Details:*  

    Sisters: [Sisters]
    Brother's: [Brothers]
    Married siblings: [Married Details]

    🔵 *Residence* 

    👉>-House owned or Rental: [House Type]
    👉>-Home size: [Size]
    👉>-Other properties (optional): [Other Properties]
    👉>-Current City: [City]
    👉>-Name of Area/Twon(Optional): [Area]
    👉>-Nationality : [Nationality]

    🔵 *Requirement* 

    👉>-Marital status: [Req Marital Status]
    👉>-Financial Status: [Req Financial]
    👉>-Age: [Req Age]
    👉>-Height: [Req Height]
    👉>-Education : [Req Education]
    👉>-Sect : [Req Sect]
    👉>-Cast: [Req Caste]
    👉>-House: [Req House]
    👉>-City: [Req City]
    👉>-Country: [Req Country]
    👉>-Other requirements(optional): [Other Requirements]

    🔵*Contact details*

    Family Contact number(compulsory): [Contact Number]
    👉>-Relation with candidate: [Relation]
    👉>-Self contact only for male(optional): [Self Contact]

    👉>- Anything else you want to tell about canidate (optional): [Notes]

    *#Nikah_Connect (Pakistan largest family based Rishta platform) Contact#03000825815*
    `;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const matches = JSON.parse(responseText);

    return Response.json({ matches });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to process AI matching' }, { status: 500 });
  }
}
