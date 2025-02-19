import { MessageButton } from 'discord.js';
import { MessageActionRow, MessageSelectMenu } from 'discord.js';
import type { User, MessageOptions, Client } from 'discord.js';
import type { EmbedField, Collection } from 'discord.js';

import { clampLength } from '../../utils/clampStr.js';
import { createEmbed } from '../../utils/discordTools.js';

export function createResponse(
  thankedUsers: Collection<string, User>,
  authorId: string,
  client: Client
): MessageOptions {
  const title = `Point${thankedUsers.size === 1 ? '' : 's'} received!`;

  const description = `<@!${authorId}> has given a point to ${thankedUsers.size === 1
    ? `<@!${thankedUsers.first().id}>`
    : 'the users mentioned below'
    }!`;

  const fields: EmbedField[] =
    thankedUsers.size > 1
      ? [...thankedUsers].map(([, u], i) => ({
        inline: false,
        name: `${(i + 1).toString()}.`,
        value: `<@!${u.id}>`,
      }))
      : [];

  const output = createEmbed({
    description,
    fields,
    footerText:
      'Thank a helpful member by replying "thanks @username" or saying "thanks" in a reply or thread.',
    provider: 'helper',
    title,
  }).embed;

  const clientId = client.user.id;

  const components = authorId === clientId ? [
    new MessageActionRow().addComponents(
      thankedUsers.size > 1
        ? new MessageSelectMenu()
          .setCustomId(`thanks🤔${authorId}🤔select`)
          .setPlaceholder('Accidentally Thank someone? Un-thank them here!')
          .setMinValues(1)
          .setOptions(
            thankedUsers.map(user => ({
              label: clampLength(user.username, 25),
              value: user.id,
            }))
          )
        : new MessageButton()
          .setCustomId(`thanks🤔${authorId}🤔${thankedUsers.first().id}`)
          .setStyle('SECONDARY')
          .setLabel('This was an accident, UNDO!')
    ),
  ] : [];

  return {
    embeds: [output],
    components,
  };
}
