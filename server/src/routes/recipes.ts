import express from 'express';
import { createRecipe, getRecipe, getRecipes } from '../controllers/recipes';

const router = express.Router();

router.route('/')
    .get(getRecipes)
    .post(createRecipe);

router.route('/:id')
    .get(getRecipe);

export default router;
