## Setup and installation instructions.

1. **Clone the repo:**

   git clone https://github.com/AbhishekDarana/music-demo-platform.git
   cd music-demo-platform

2. **Install dependencies:**

    I have been using Node25, run the command

    npm install

## Env variables needed

Use NEXT_PUBLIC_SUPABASE_URL, RESEND_API_KEY,NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, INNGEST_EVENT_KEY.

They can be get from Supabase, Resend and Inngest platforms.


## An overview of your database schema.

I have 2 tables as following- 

submissions     
_________________________________________
id |
created_at |
name |
email |
bio |
instagram |
spotify |
status |
rating |
notes


tracks
___________________________________________

id |
created_at |
submission_id  |
title |
genre |
bpm |
key_signature |
description |
file_url |
