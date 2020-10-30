import { Router } from 'express';
import Guilds from '../../../data/guilds';
import Users from '../../../data/users';
import Deps from '../../../utils/deps';
import { sendError } from '../../modules/api-utils';
import { getUser } from '../../modules/api-utils';
import { bot } from '../../../bot';

export const router = Router({ mergeParams: true });

const guilds = Deps.get<Guilds>(Guilds),
      users = Deps.get<Users>(Users);

router.get('/add-badge/:name', async (req, res) => {
  try {
    const reviewer = await getUser(req.query.key);
    const savedReviewer = await users.get(reviewer);
    if (savedReviewer.role !== 'admin')
      throw new TypeError('Insufficient permissions.');
    
    const exists = await guilds.exists(req.params.id);
    if (!exists)
      throw new TypeError('Server does not exist.');
    
    const guild = bot.guilds.cache.get(req.params.id);
    const savedGuild = await guilds.get(guild);
    savedGuild.badges.push(req.params.name);
    await savedGuild.save();
    
    res.json({ success: true });
  } catch (error) { sendError(res, 400, error); }
});