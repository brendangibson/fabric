### Adding a new style/colour

1. Take a photo of the fabric

on this machine:

2. Put the photo in the `public/assets` directory
3. `npm run build`
4. `git add .`
5. `git commit -m "Adding a new style"`
6. `git push`

ssh to the server

7. `git pull`

on AWS AppSync

8. Login - go to Cognito>App client settings to get the id
9. Run `GetColours` query. Store the colour id.
10. Run `GetStyles` query. Store the style id
11. `swatchUrl` should be set to `https://sienandco.space/assets/` + your new file from above
12. Run `CreateStyleColour` mutation with the `colourId`, `styleId`, `glenRavenName`, and `swatchUrl`

### Run code locally

1. `npm run start`

### Connect to the database

1. Get the URL of the Writer
2. `mysql -h appsyncrdsinstance-rcy4ohoyyzhlvahtxrucs5oix4.clghn7faucwg.us-east-2.rds.amazonaws.com -u master -p`
3. If that fails, you may have to update your IP for the security group for the Writer
4. If that fails try rebooting the database in the AWS console
5. `use myrds`
6. `show tables;`

### Add in a new style/colour

1. Take a picture of the fabric. Put that image in `public/assets`. Build an deploy
2. `INSERT INTO colours (id, name) VALUES (uuid(), 'New Colour Name');`
3. `INSERT INTO styles (id, name) VALUES (UUID(), 'New Style Name');`
4. `INSERT INTO stylesColours (id, colourId, styleId, swatchUrl) VALUES (uuid(), 'New Colour Id', 'New Style ID', 'https://sienandco.space/assets/newimage.jpg')`
