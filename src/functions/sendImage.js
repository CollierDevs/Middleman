/*
Middleman - Peer Reviewed Image API"s.
Copyright (C) 2020 ChecksumDev

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
*/

const Discord = require("discord.js");
const path = require('path');
const { measureMemory } = require("vm");
const { client } = require("../main");
const { Images } = require('./database');
const { getBooruImage } = require("./getBooruImage");
const logger = require("./logger");

async function sendImage(channel) {
    let urlcache = await getBooruImage();
    let logch = client.channels.cache.get('793726527744245780');

    if (urlcache == 'https://danbooru.donmai.us/') return sendImage(channel);

    const result = await Images.findOne({ where: { url: urlcache } });
    if (result) {
        logger.log(`Skipping ${urlcache}. The image has already been reviewed.`);
        return sendImage(channel);
    };

    if (path.extname(urlcache) == '.mp4') return sendImage(channel) // Return if the file is a mp4

    logger.log(`Sending ${urlcache} to be reviewed.`);
    let embed = new Discord.MessageEmbed()
        .setAuthor("Middleman", client.user.displayAvatarURL({ dynamic: true }), `https://saucenao.com/search.php?db=999&url=${urlcache}`)
        .addFields([{
            name: 'Rating',
            value: 'None',
            inline: true,
        }, {
            name: "Reviewer",
            value: `None`,
            inline: true,
        }])
        .setImage(`${urlcache}`)
        .setColor("#004c4c")
        .setFooter(`© Copyright ChecksumDev 2020`);
    await channel.send(embed).then(async (msg) => {
        await msg.react("✅");
        await msg.react("❌");
        await msg.react("⛔");
        await msg.react("➡️");

        const filter = (reaction) => {
            return ["✅", "❌", "⛔", "➡️"].includes(reaction.emoji.name);
        };

        msg.awaitReactions(filter, { max: 1 })
            .then(async (collected) => {
                const reaction = collected.first();

                if (reaction.emoji.name === "✅") {
                    logger.log(`The image ${urlcache} was marked as SFW`)
                    try {
                        // equivalent to: INSERT INTO tags (url, rating, author) values (?, ?, ?);
                        const image = await Images.create({
                            url: urlcache,
                            rating: 'SFW',
                            author: `${reaction.users.cache.last().id}`,
                        });
                        let sfwembed = new Discord.MessageEmbed()
                            .setAuthor("Middleman", client.user.displayAvatarURL({ dynamic: true }), `https://saucenao.com/search.php?db=999&url=${urlcache}`)
                            .setColor("GREEN")
                            .setImage(urlcache)
                            .addFields([{
                                name: "Rating",
                                value: "Safe for work.",
                                inline: true
                            }, {
                                name: "Reviewer",
                                value: `${reaction.users.cache.last()} (${reaction.users.cache.last().id})`,
                                inline: true
                            }])
                            .setFooter(`Image ID: ${image.get('id')}`)
                            .setTimestamp();
                        await msg.reactions.removeAll();
                        await msg.edit(sfwembed);
                        await msg.reactions.removeAll();
                        await logch.send(sfwembed)
                        return sendImage(channel);
                    }
                    catch (e) {
                        if (e.name === 'SequelizeUniqueConstraintError') {
                            return sendImage(channel);
                        }
                        return sendImage(channel);
                    }
                } else if (reaction.emoji.name == "❌") {
                    logger.log(`The image ${urlcache} was marked as NSFW`)
                    try {
                        // equivalent to: INSERT INTO tags (url, rating, author) values (?, ?, ?);
                        const image = await Images.create({
                            url: urlcache,
                            rating: 'NSFW',
                            author: `${reaction.users.cache.last().id}`,
                        });
                        let nsfwembed = new Discord.MessageEmbed()
                            .setAuthor("Middleman", client.user.displayAvatarURL({ dynamic: true }), `https://saucenao.com/search.php?db=999&url=${urlcache}`)
                            .setColor("RED")
                            .setImage(urlcache)
                            .addFields([{
                                name: "Rating",
                                value: "Not safe for work.",
                                inline: true
                            }, {
                                name: "Reviewer",
                                value: `${reaction.users.cache.last()} (${reaction.users.cache.last().id})`,
                                inline: true
                            }])
                            .setFooter(`Image ID: ${image.get('id')}`)
                            .setTimestamp();
                        await msg.reactions.removeAll();
                        await msg.edit(nsfwembed);
                        await msg.reactions.removeAll();
                        await logch.send(nsfwembed)
                        return sendImage(channel);
                    }
                    catch (e) {
                        if (e.name === 'SequelizeUniqueConstraintError') {
                            return sendImage(channel);
                        }
                        return sendImage(channel);
                    }
                } else if (reaction.emoji.name == "⛔") {
                    logger.log(`The image ${urlcache} was marked as LOLI`)
                    try {
                        // equivalent to: INSERT INTO tags (url, rating, author) values (?, ?, ?);
                        const image = await Images.create({
                            url: urlcache,
                            rating: 'LOLI',
                            author: `${reaction.users.cache.last().id}`,
                        });
                        let loliembed = new Discord.MessageEmbed()
                            .setAuthor("Middleman", client.user.displayAvatarURL({ dynamic: true }), `https://saucenao.com/search.php?db=999&url=${urlcache}`)
                            .setImage(urlcache)
                            .addFields([{
                                name: "Rating",
                                value: "Loli.",
                                inline: true
                            }, {
                                name: "Reviewer",
                                value: `${reaction.users.cache.last()} (${reaction.users.cache.last().id})`,
                                inline: true
                            }])
                            .setColor("PURPLE")
                            .setFooter(`Image ID: ${image.get('id')}`)
                            .setTimestamp();
                        await msg.reactions.removeAll();
                        await msg.edit(loliembed);
                        await msg.reactions.removeAll();
                        await logch.send(loliembed)
                        return sendImage(channel);
                    }
                    catch (e) {
                        if (e.name === 'SequelizeUniqueConstraintError') {
                            return sendImage(channel);
                        }
                        return sendImage(channel);
                    }
                } else if (reaction.emoji.name == "➡️") {
                    let embed = new Discord.MessageEmbed()
                        .setAuthor("Middleman", client.user.displayAvatarURL({ dynamic: true }), `https://saucenao.com/search.php?db=999&url=${urlcache}`)
                        .addFields([{
                            name: 'Rating',
                            value: 'Skipped',
                            inline: true,
                        }, {
                            name: "Reviewer",
                            value: `Skipped`,
                            inline: true,
                        }])
                        .setImage(`${urlcache}`)
                        .setColor("BLUE")
                        .setFooter("© Copyright Middleman 2020");
                    await msg.reactions.removeAll();
                    await msg.edit(embed);
                    await msg.reactions.removeAll();
                    return sendImage(channel);
                }
            });
    });
}

exports.sendImage = sendImage;