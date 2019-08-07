# PoDGear Extension Rework
The current extension (live on twitch @ https://www.twitch.tv/ext/y7nljab2luv2yjf34h7nmmz3ajbj08) is a video overlay that leaves a button on the stream and when pressed opens the inventory of the currently played character. It also runs a backend with nodejs on a vps.

Why a rework then?

Backend reason: we now have an api that feeds a json file with character data so we can cut out the backend server which read raw char data from binary.
Frontend reason: we want to change from video overlay to component because streamers can run multiple components at a time.

The goal, should you choose to help, is to create a compact armory that can fit in a small window and utilize the full space of said window in order to satisfy twitch requirements. The armory should at the very least show the current player's gear but could in theory show anything being output by the api.

The api isnt public yet but example api outputs have been generated so that work on this extension can begin.

The repo at time of creation will only contains necessary assets but does not contain substanial code yet. It will be designed from ground up by whoever wishes to help in the community. Thanks for your help.
