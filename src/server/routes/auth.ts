import { Router } from 'express';
import { celebrate, Joi, Segments, errors } from 'celebrate';
import { authenticateJWT, tryAuthenticateJWT } from '../middlewares/jwt';
import { collectData, CommonLib } from '@utils';
import { AuthService } from '@services';
import { Auth } from '../controllers';

export const router = Router();

router.post('/register',
  celebrate({
    [Segments.BODY]: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(12).max(128).required(),
    })
  }),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await AuthService.register(email.toLowerCase(), password);
      res.status(201).json({ id: user.id, email: user.email });
    } catch (e) { next(e); }
  }
);

router.post('/login',
  celebrate({
    [Segments.BODY]: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    })
  }),
  async (req: any, res, next) => {
    try {
      const { ip, origin } = collectData(req);
      const { email, password, sessionId } = req.body;
      const { accessToken, refreshToken } = await Auth.login(email, password, sessionId, ip, origin);
      res.json({ accessToken, refreshToken });
    } catch (e) { next(e); }
  }
);

router.post('/login/guest', tryAuthenticateJWT,
  async (req: any, res, next) => {
    try {
      const { ip, origin } = collectData(req);
      const { sessionId } = req.body;
      const result = await Auth.loginAsGuest(req.user?.sub, sessionId, ip, origin);
      res.json(result);
    } catch (e) { next(e); }
  }
);

router.post('/login/admin',
  celebrate({
    [Segments.BODY]: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    })
  }),
  async (req: any, res, next) => {
    try {
      const { ip, origin } = collectData(req);
      const { email, password, sessionId } = req.body;
      const { accessToken, refreshToken } = await Auth.loginAsAdmin(email, password, sessionId, ip, origin);
      res.json({ accessToken, refreshToken });
    } catch (e) { next(e); }
  }
);

router.post('/refresh',
  celebrate({
    [Segments.BODY]: Joi.object({ refreshToken: Joi.string().required() })
  }),
  async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      const tokens = await AuthService.refresh(refreshToken);
      res.json(tokens);
    } catch (e) { next(e); }
  }
);

router.post('/logout', authenticateJWT, async (req: any, res, next) => {
    try {
      const { userId, roles } = collectData(req);
      if (roles.length === 1 && roles.includes('guest')) {
        res.status(400).send('Unable process logout');
        return;
      }
      await Auth.logout(userId, req);      
      res.json(userId);
    } catch (e) { next(e); }
  }
);

router.get('/me', authenticateJWT, async (req: any, res: any) => {
  const user = await AuthService.getById(req.user.sub);
  res.json({ id: user.id, email: user.email, roles: user.roles });
});

router.get('/uuid', (req: any, res: any) => {
  res.json({ uuid: AuthService.generateUUID(), uuid2: CommonLib.generateUUID() });
});

// celebrate error handler (400 on validation errors)
router.use(errors());