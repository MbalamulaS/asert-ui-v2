import {Equipment} from 'modules/setup/equipment/equipment';
import {Premise} from 'modules/setup/premise/premise';
import {Infrastructure} from 'modules/setup/infrastructure/infrastructure';
import {StaffTitle} from 'modules/setup/staff-title/staff-title.service';

/**
 * Represents a facility level in the health facility registry.
 */
export interface FacilityLevel {
  /**
   * Unique identifier for the facility level.
   * @type {number}
   */
  id: number;

  /**
   * Universally unique identifier for the facility level.
   * Optional field for identifying specific instances.
   * @type {string}
   */
  uuid?: string;

  /**
   * Name of the facility level.
   * @type {string}
   */
  name: string;

  /**
   * Code representing the facility level.
   * @type {string}
   */
  code: string;

  /**
   * Identifier for the group to which this facility level belongs.
   * Optional field to establish relationships with level groups.
   * @type {number}
   */
  levelGroupId?: number;

  /**
   * Price associated with the facility level.
   * Optional field for cost-related information.
   * @type {number}
   */
  price?: number;

  /**
   * Rank or hierarchy level of the facility level.
   * Optional field to denote the level's position within the hierarchy.
   * @type {number}
   */
  levelRank?: number;

  /**
   * Services associated with the facility level.
   * Accepts an array of strings or specific service type.
   * Optional field to list services provided at this level.
   * @type {string[]}
   */
  services?: string[];

  equipments?: Equipment[];
  premises?: Premise[];
  infrastructures?: Infrastructure[];
  staffTitles?: StaffTitle[];
}
