# The Halo Dojo

A real-time looking-for-group and teammate recommendation system for Halo online multiplayer.

### *This is a work-in-progress*

## Overview

Halo is a competitive online game that benefits strongly from effective teamwork and communication. However, so many players on Xbox Live play without microphones that relying on automatic matchmaking to provide random teammates is often a frustrating and discouraging experience (the infamous "solo queue"). 

This project aims to make it easy to find and team up with compatible players who are interested in teamwork and communication. 

### Realtime Search

The realtime search lobby enables players to find other players who are **ready to play** at any given time. Socket.io is used to push updates from the server as players join and leave the lobby, such that the page always stays current. Each player in the lobby can set a status message indicating their preferred playlists, how many teammates they need, or anything else they care to share. They can message other players in the lobby with the built-in chat to quickly arrange to team up.

### Suggested Players

Players can maintain a simple profile describing their preferred and avoided gametypes. These preferences and the players' experience and skill metrics will be used to find similar players and provide a list of potentially compatible teammates.  


## Technologies used

This is a full-stack JavaScript web application.

**Backend**: <a href="http://nodejs.org/">Node.js</a> server built with <a href="http://hapijs.com/">Hapi.js</a>, and a <a href="http://neo4j.com/">Neo4j</a> graph database.

**Frontend**: <a href="http://facebook.github.io/react/">React.js</a> interface with <a href="http://facebook.github.io/flux/docs/overview.html">Flux</a> application architecture.

**Network**: <a href="https://github.com/hueniverse/hawk">Hawk</a> authentication, <a href="http://socket.io/">Socket.io</a> for messaging and server-initiated updates, <a href="http://visionmedia.github.io/superagent/">Superagent</a> for ajax, and <a href="http://phantomjs.org/">Phantom.js</a> for scraping.


## Screenshots

![Landing page](screenshot-frontpage.png)

![Dashboard](screenshot-dashboard.png)
