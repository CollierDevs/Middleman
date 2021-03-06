/*
Middleman - Peer Reviewed Image API"s.
Copyright (C) 2020 Checksum

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
const { client } = require("../main");
const { Images, Users } = require('./database');
const { getBooruImage } = require("./getBooruImage");
const { createImage } = require("./createImage");
const logger = require("./logger");
const { buildErrorMessage } = require("./buildErrorMessage");

async function startReview(channel) {
    let urlcache = await getBooruImage(false);
    if (urlcache == null) {
        logger.error("No images with the specified tag(s) could be found. Activating override.")
        return getBooruImage(true);
    }

    let logch = client.channels.cache.get('793726527744245780');
    logger.log(`Sending ${urlcache} to be reviewed.`);

    let embed = new Discord.MessageEmbed()
        .setAuthor("Image not loading? Click here!", client.user.displayAvatarURL({ dynamic: true }), `${urlcache}`)
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
        .setColor("#0D98BA")
        .setFooter(`© Copyright Checksum`);
    await channel.send(embed).then(async (msg) => {
        await msg.react("✅");
        await msg.react("❌");
        await msg.react("⛔");
        await msg.react("❔");

        const filter = (reaction) => {
            return ["✅", "❌", "⛔", "❔"].includes(reaction.emoji.name);
        };

        msg.awaitReactions(filter, { max: 1 })
            .then(async (collected) => {
                const reaction = collected.first();
                const user = reaction.users.cache.last();
                const user_id = user.id;

                const result = await Users.findOne({ where: { userid: `${user_id}` } });
                if (!result) {
                    await Users.create({
                        userid: `${user_id}`,
                        count: 0,
                    });
                }
                switch (reaction.emoji.name) {
                    case "✅":
                        logger.log(`The image ${urlcache} was marked as SFW`)
                        try {
                            // equivalent to: INSERT INTO tags (url, rating, user) values (?, ?, ?);
                            const image = await createImage(urlcache, user_id, "SFW");
                            await result.increment('count')
                            let sfwembed = new Discord.MessageEmbed()
                                .setAuthor("Middleman", client.user.displayAvatarURL({ dynamic: true }), `${urlcache}`)
                                .setColor("GREEN")
                                .setImage(urlcache)
                                .addFields([{
                                    name: "Rating",
                                    value: "Safe for work.",
                                    inline: true
                                }, {
                                    name: "Reviewer",
                                    value: `${user} (${user_id})`,
                                    inline: true
                                }])
                                .setFooter(`Image ID: ${image.id}`)
                                .setTimestamp();
                            await msg.edit(sfwembed);
                            await msg.reactions.removeAll();
                            await logch.send(sfwembed)
                            return startReview(channel);
                        }
                        catch (e) {
                            if (e.name === 'SequelizeUniqueConstraintError') {
                                return startReview(channel);
                            }
                            return startReview(channel);
                        }
                    case "❌":
                        logger.log(`The image ${urlcache} was marked as NSFW`)
                        try {
                            // equivalent to: INSERT INTO tags (url, rating, user) values (?, ?, ?);
                            const image = await createImage(urlcache, user_id, "NSFW");
                            await result.increment('count')
                            let nsfwembed = new Discord.MessageEmbed()
                                .setAuthor("Middleman", client.user.displayAvatarURL({ dynamic: true }), `${urlcache}`)
                                .setColor("RED")
                                .setImage(urlcache)
                                .addFields([{
                                    name: "Rating",
                                    value: "Not safe for work.",
                                    inline: true
                                }, {
                                    name: "Reviewer",
                                    value: `${user} (${user_id})`,
                                    inline: true
                                }])
                                .setFooter(`Image ID: ${image.id}`)
                                .setTimestamp();
                            await msg.edit(nsfwembed);
                            await msg.reactions.removeAll();
                            await logch.send(nsfwembed)
                            return startReview(channel);
                        }
                        catch (e) {
                            if (e.name === 'SequelizeUniqueConstraintError') {
                                return startReview(channel);
                            }
                            return startReview(channel);
                        }
                    case "⛔":
                        logger.log(`The image ${urlcache} was marked as LOLI`)
                        try {
                            // equivalent to: INSERT INTO tags (url, rating, user) values (?, ?, ?);
                            const image = await createImage(urlcache, user_id, "LOLI");
                            await result.increment('count')
                            let loliembed = new Discord.MessageEmbed()
                                .setAuthor("Middleman", client.user.displayAvatarURL({ dynamic: true }), `${urlcache}`)
                                .setImage(urlcache)
                                .addFields([{
                                    name: "Rating",
                                    value: "Loli.",
                                    inline: true
                                }, {
                                    name: "Reviewer",
                                    value: `${user} (${user_id})`,
                                    inline: true
                                }])
                k                .setColor("PURPLE")
                                .setFooter(`Image ID: ${image.id}`)
                                .setTimestamp();
                            await msg.edit(loliembed);
                            await msg.reactions.removeAll();
                            await logch.send(loliembed)
                            return startReview(channel);
                        }
                        catch (e) {
                            if (e.name === 'SequelizeUniqueConstraintError') {
                                return startReview(channel);
                            }
                            return startReview(channel);
                        }
                    case "❔":
                        logger.log(`The image ${urlcache} was marked as MISC`)
                        try {
                            // equivalent to: INSERT INTO tags (url, rating, user) values (?, ?, ?);
                            const image = await Images.create({
                                url: urlcache,
                                rating: 'MISC',
                                user: `${user_id}`,
                            });
                            await result.increment('count');
                            let embed = new Discord.MessageEmbed()
                                .setAuthor("Middleman", client.user.displayAvatarURL({ dynamic: true }), `${urlcache}`)
                                .addFields([{
                                    name: 'Rating',
                                    value: 'Image does not apply to classification.',
                                    inline: true,
                                }, {
                                    name: "Reviewer",
                                    value: `${user} (${user_id})`,
                                    inline: true,
                                }])
                                .setImage(`${urlcache}`)
                                .setColor("WHITE")
                                .setFooter(`Image ID: ${image.id}`)
                            await msg.edit(embed);
                            await msg.reactions.removeAll();
                            await logch.send(embed)
                            return startReview(channel);
                        }
                        catch (e) {
                            if (e.name === 'SequelizeUniqueConstraintError') {
                                msg.channel.send(buildErrorMessage(`SequelizeUniqueConstraintError`));
                                return startReview(channel);
                            }
                            return startReview(channel);
                        }
                    default:
                        msg.channel.send(buildErrorMessage(`Something has very gone wrong, a reaction was interpreted where it should not be possible.`));
                        logger.error("Something has very gone wrong, a reaction was interpreted where it should not be possible.")
                        process.exit(1);
                }
            });
    });
}

exports.startReview = startReview;