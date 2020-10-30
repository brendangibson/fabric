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
