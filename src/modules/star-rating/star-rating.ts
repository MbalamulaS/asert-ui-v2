import { PropertyType } from 'modules/portal/hotels/types';

export interface StarRating {
  id: number;
  uuid?: string;
  propertyType: PropertyType;
  starLevel: string;
  name: string;
  minScore: number;
  maxScore: number;
  totalPossibleScore: number;
  criteriaDescription?: string;
  percentageRequired?: number;

  // Legacy fields for backward compatibility (deprecated)
  ratingLevel?: string;
}
