
import React from 'react';
import { Recipe } from '../types';
import { ChefHat, Flame, ListChecks } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="p-1 bg-red-600"></div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <ChefHat className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">{recipe.name}</h3>
          </div>
          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3 h-3" />
            {recipe.style}
          </span>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <ListChecks className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-tight mb-1">Method</p>
              <p className="text-slate-600 leading-relaxed text-sm">
                {recipe.instructions}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-slate-50">
          <button className="w-full py-2 bg-slate-50 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-100 transition-colors">
            View Full Step-by-Step
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
