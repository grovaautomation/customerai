#!/bin/bash
export DATABASE_URL='postgresql://customerai:CustomerAI_Secure2026%21@localhost:5432/customerai'
export NODE_ENV=production
cd /var/www/customerai
exec ./node_modules/.bin/next start -p 8082
