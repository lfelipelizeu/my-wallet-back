import { Request, Response } from 'express';
import * as userService from '../services/userService';
import * as sessionService from '../services/sessionService';

async function signUp(req: Request, res: Response) {
    const validationError = userService.signUpDataValidationError(req.body);
    if (validationError) return res.status(400).send(validationError.message);

    try {
        const user = await userService.findEmail(req.body.email);

        if (user) return res.sendStatus(409);

        await userService.createUser(req.body);

        return res.sendStatus(201);
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
}

async function signIn(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) return res.sendStatus(400);

    try {
        const user = await userService.findEmail(email);

        if (!user) return res.sendStatus(404);
        if (!userService.isPasswordValid(password, user.password)) return res.sendStatus(401);

        const token = await sessionService.createNewSession(user.id);

        return res.status(200).send({
            name: user.name,
            token,
        });
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
}

export {
    signUp,
    signIn,
};
