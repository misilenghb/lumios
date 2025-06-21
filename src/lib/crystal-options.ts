import type { CrystalData } from '@/types/design';

export type CrystalTypeMapping = Record<string, CrystalData>;

// Notes:
// - displayName: Should be "Chinese Name (English Name)" for proper translation parsing by getCrystalDisplayName.
// - englishName: The canonical English name.
// - availableColors: Array of English color names.
// - specificInclusions: Keys for inclusions unique or highly characteristic of this crystal. Must be translated in locale files.
// - Universal inclusions (defined in types/design.ts) are added dynamically by the form.

export const crystalTypeMapping: CrystalTypeMapping = {
  RoseQuartz: {
    displayName: '粉晶 (Rose Quartz)',
    englishName: 'Rose Quartz',
    availableColors: ['Pink', 'Light Pink', 'Rose Pink', 'Pale Pink'],
    specificInclusions: ['inclusion_dumortierite_specific_rose', 'inclusion_asterism_star_rose', 'inclusion_rutile_fibers_rose'],
    healingProperties: ['prop_love', 'prop_compassion', 'prop_emotional_healing', 'prop_self_acceptance'],
    chakra: ['chakra_heart'],
    element: ['element_water'],
    zodiac: ['zodiac_taurus', 'zodiac_libra'],
  },
  Amethyst: {
    displayName: '紫水晶 (Amethyst)',
    englishName: 'Amethyst',
    availableColors: ['Purple', 'Lavender', 'Deep Purple', 'Lilac'],
    specificInclusions: ['inclusion_goethite_specific_amethyst', 'inclusion_cacoxenite_specific_amethyst', 'inclusion_chevron_markings_amethyst', 'inclusion_zebra_stripes_amethyst'],
    healingProperties: ['prop_spirituality', 'prop_protection', 'prop_calmness', 'prop_intuition'],
    chakra: ['chakra_thirdEye', 'chakra_crown'],
    element: ['element_air', 'element_water', 'element_ether'],
    zodiac: ['zodiac_pisces', 'zodiac_virgo', 'zodiac_aquarius', 'zodiac_sagittarius'],
  },
  ClearQuartz: {
    displayName: '白水晶 (Clear Quartz)',
    englishName: 'Clear Quartz',
    availableColors: ['Clear', 'White'],
    specificInclusions: ['inclusion_chlorite_phantom_clear', 'inclusion_rutile_needles_clear', 'inclusion_tourmaline_needles_clear', 'inclusion_hematite_flakes_clear', 'inclusion_rainbow_fractures_clear', 'inclusion_record_keepers_clear'],
    healingProperties: ['prop_amplification', 'prop_clarity', 'prop_healing', 'prop_energy_cleansing'],
    chakra: ['chakra_all'],
    element: ['element_all'],
    zodiac: ['zodiac_all'],
  },
  Citrine: {
    displayName: '黄水晶 (Citrine)',
    englishName: 'Citrine',
    availableColors: ['Yellow', 'Golden Yellow', 'Orange-Yellow', 'Brownish Yellow'],
    specificInclusions: ['inclusion_smoky_phantoms_citrine', 'inclusion_rainbows_internal_citrine', 'inclusion_healed_fractures_citrine'],
    healingProperties: ['prop_abundance', 'prop_manifestation', 'prop_creativity', 'prop_optimism'],
    chakra: ['chakra_solarPlexus', 'chakra_sacral', 'chakra_crown'],
    element: ['element_fire'],
    zodiac: ['zodiac_aries', 'zodiac_gemini', 'zodiac_leo', 'zodiac_libra'],
  },
  Moonstone: {
    displayName: '月光石 (Moonstone)',
    englishName: 'Moonstone',
    availableColors: ['White', 'Blue Sheen', 'Rainbow', 'Peach', 'Grey', 'Yellow', 'Pink'],
    specificInclusions: ['inclusion_centipede_moonstone', 'inclusion_adularescence_effect_moonstone', 'inclusion_black_tourmaline_moonstone'],
    healingProperties: ['prop_new_beginnings', 'prop_intuition', 'prop_feminine_energy', 'prop_emotional_balance'],
    chakra: ['chakra_sacral', 'chakra_thirdEye', 'chakra_crown'],
    element: ['element_water'],
    zodiac: ['zodiac_cancer', 'zodiac_libra', 'zodiac_scorpio'],
  },
  Labradorite: {
    displayName: '拉长石 (Labradorite)',
    englishName: 'Labradorite',
    availableColors: ['Grey-Green', 'Dark Grey', 'Black', 'Blue Flash', 'Green Flash', 'Gold Flash', 'Rainbow Flash'],
    specificInclusions: ['inclusion_labradorescence_effect_labradorite', 'inclusion_ilmenite_needles_labradorite', 'inclusion_magnetite_crystals_labradorite'],
    healingProperties: ['prop_transformation', 'prop_protection', 'prop_strengthens_intuition', 'prop_magic'],
    chakra: ['chakra_thirdEye', 'chakra_throat', 'chakra_crown'],
    element: ['element_water', 'element_wind'],
    zodiac: ['zodiac_leo', 'zodiac_scorpio', 'zodiac_sagittarius'],
  },
  SmokyQuartz: {
    displayName: '茶晶 (Smoky Quartz)',
    englishName: 'Smoky Quartz',
    availableColors: ["Light Brown", "Dark Brown", "Greyish Brown", "Blackish Brown", "Yellowish Brown"],
    specificInclusions: ["inclusion_rutile_needles_smoky", "inclusion_phantom_growth_smoky", "inclusion_goethite_smoky_specific"],
    healingProperties: ["prop_grounding", "prop_protection_negativity", "prop_stress_relief", "prop_detoxification"],
    chakra: ["chakra_root"],
    element: ["element_earth"],
    zodiac: ["zodiac_scorpio", "zodiac_sagittarius", "zodiac_capricorn"]
  },
  LapisLazuli: {
    displayName: '青金石 (Lapis Lazuli)',
    englishName: 'Lapis Lazuli',
    availableColors: ["Deep Blue", "Royal Blue", "Azure Blue", "Blue with Gold Flecks"],
    specificInclusions: ["inclusion_pyrite_flecks_lapis", "inclusion_calcite_veins_lapis", "inclusion_sodalite_lapis_specific", "inclusion_diopside_lapis_specific", "inclusion_hauyne_lapis"],
    healingProperties: ["prop_wisdom", "prop_truth", "prop_communication", "prop_inner_peace"],
    chakra: ["chakra_throat", "chakra_thirdEye"],
    element: ["element_water", "element_air"],
    zodiac: ["zodiac_sagittarius", "zodiac_libra", "zodiac_taurus"]
  },
  Turquoise: {
    displayName: '绿松石 (Turquoise)',
    englishName: 'Turquoise',
    availableColors: ["Sky Blue", "Blue-Green", "Green", "Robin's Egg Blue"],
    specificInclusions: ["inclusion_limonite_matrix_turquoise", "inclusion_sandstone_matrix_turquoise", "inclusion_pyrite_crystals_turquoise", "inclusion_spiderweb_matrix_turquoise", "inclusion_quartz_veinlets_turquoise"],
    healingProperties: ["prop_protection_travel", "prop_healing_master", "prop_communication_throat", "prop_spiritual_attunement"],
    chakra: ["chakra_throat", "chakra_thirdEye"],
    element: ["element_earth", "element_air", "element_fire"],
    zodiac: ["zodiac_sagittarius", "zodiac_pisces", "zodiac_scorpio"]
  },
  Garnet: {
    displayName: '石榴石 (Garnet)',
    englishName: 'Garnet',
    availableColors: ["Deep Red", "Reddish Brown", "Orange", "Pink", "Purple", "Red-Purple"],
    specificInclusions: ["inclusion_rutile_needles_garnet_specific", "inclusion_asterism_garnet_specific", "inclusion_chromite_pyrope_garnet", "inclusion_apatite_garnet_specific"],
    healingProperties: ["prop_energy_vitality", "prop_passion_love", "prop_protection_aura", "prop_manifestation_goals"],
    chakra: ["chakra_root", "chakra_heart", "chakra_sacral"],
    element: ["element_fire", "element_earth"],
    zodiac: ["zodiac_aries", "zodiac_leo", "zodiac_virgo", "zodiac_capricorn", "zodiac_aquarius"]
  },
  BlackTourmaline: {
    displayName: '黑碧玺 (Black Tourmaline)',
    englishName: 'Black Tourmaline',
    availableColors: ["Black", "Very Dark Brown"],
    specificInclusions: ["inclusion_striations_tourmaline_specific", "inclusion_quartz_intergrowth_tourmaline_specific", "inclusion_mica_flakes_tourmaline_specific", "inclusion_feldspar_matrix_tourmaline"],
    healingProperties: ["prop_protection_emf", "prop_grounding_energy", "prop_negativity_shield", "prop_purification"],
    chakra: ["chakra_root"],
    element: ["element_earth"],
    zodiac: ["zodiac_capricorn", "zodiac_libra"]
  },
  Selenite: {
    displayName: '透石膏 (Selenite)',
    englishName: 'Selenite',
    availableColors: ["White", "Translucent White", "Peach", "Orange", "Green (rare)"],
    specificInclusions: ["inclusion_sand_selenite_specific"], // Sand can be included in desert rose selenite
    healingProperties: ["prop_cleansing_aura", "prop_spiritual_connection", "prop_peace_calm", "prop_mental_clarity_selenite"],
    chakra: ["chakra_crown", "chakra_thirdEye", "chakra_soul_star"],
    element: ["element_water", "element_air"],
    zodiac: ["zodiac_taurus", "zodiac_cancer"]
  },
  Malachite: {
    displayName: '孔雀石 (Malachite)',
    englishName: 'Malachite',
    availableColors: ["Green", "Banded Green (light to dark)", "Dark Green"],
    specificInclusions: ["inclusion_concentric_bands_malachite_specific", "inclusion_swirling_patterns_malachite_specific", "inclusion_botryoidal_formation_malachite", "inclusion_azurite_intergrowth_malachite_specific", "inclusion_fibrous_radiating_malachite"],
    healingProperties: ["prop_transformation_change", "prop_heart_healing", "prop_protection_negative_energies", "prop_spiritual_growth_malachite"],
    chakra: ["chakra_heart", "chakra_solarPlexus", "chakra_throat"],
    element: ["element_earth", "element_fire"],
    zodiac: ["zodiac_capricorn", "zodiac_scorpio", "zodiac_taurus"]
  },
  Aquamarine: {
    displayName: '海蓝宝 (Aquamarine)',
    englishName: 'Aquamarine',
    availableColors: ["Pale Blue", "Blue-Green", "Light Blue", "Sky Blue", "Sea Green"],
    specificInclusions: ["inclusion_hollow_tubes_aqua_specific", "inclusion_parallel_growth_tubes_aqua_specific", "inclusion_rain_like_inclusions_aqua", "inclusion_biotite_flakes_aqua_specific", "inclusion_muscovite_aqua"],
    healingProperties: ["prop_courage_communication", "prop_calming_soothing", "prop_truth_expression", "prop_spiritual_awareness_aqua"],
    chakra: ["chakra_throat", "chakra_heart"],
    element: ["element_water"],
    zodiac: ["zodiac_aries", "zodiac_gemini", "zodiac_pisces", "zodiac_aquarius"]
  },
  PhantomQuartz: {
    displayName: '幽灵水晶 (Phantom Quartz)',
    englishName: 'Phantom Quartz',
    availableColors: ['Clear with Green Phantoms', 'Clear with Red Phantoms', 'Clear with White Phantoms', 'Smoky with Phantoms', 'Amethyst with Phantoms'],
    specificInclusions: ['inclusion_chlorite_phantom_specific', 'inclusion_hematite_phantom_specific', 'inclusion_kaolinite_phantom_specific', 'inclusion_limonite_phantom_specific', 'inclusion_multiple_stacked_phantoms', 'inclusion_angel_wing_phantom_specific'],
    healingProperties: ['prop_growth_evolution', 'prop_past_life_recall', 'prop_overcoming_stagnation', 'prop_universal_awareness'],
    chakra: ['chakra_all', 'chakra_crown', 'chakra_root'],
    element: ['element_earth', 'element_storm'],
    zodiac: ['zodiac_all']
  },
  RutilatedQuartz: {
    displayName: '发晶 (Rutilated Quartz)',
    englishName: 'Rutilated Quartz',
    availableColors: ['Clear with Gold Rutile', 'Clear with Silver Rutile', 'Clear with Red Rutile', 'Clear with Black Rutile', 'Smoky with Gold Rutile'],
    specificInclusions: ['inclusion_rutile_needles_gold_specific', 'inclusion_rutile_needles_silver_specific', 'inclusion_rutile_needles_red_specific', 'inclusion_rutile_needles_black_specific', 'inclusion_star_rutile_formation', 'inclusion_hematite_base_rutile_specific'],
    healingProperties: ['prop_amplification_intentions', 'prop_spiritual_growth_rutilated', 'prop_cleansing_energizing', 'prop_manifestation_attraction', 'prop_psychic_enhancement'],
    chakra: ['chakra_all', 'chakra_solarPlexus'],
    element: ['element_fire', 'element_air'],
    zodiac: ['zodiac_leo', 'zodiac_gemini', 'zodiac_taurus']
  },
  StrawberryQuartz: {
    displayName: '草莓晶 (Strawberry Quartz)',
    englishName: 'Strawberry Quartz',
    availableColors: ['Pinkish Red', 'Red with Seeds', 'Light Pink', 'Deep Pink', 'Orange-Pink'],
    specificInclusions: ['inclusion_hematite_dots_strawberry', 'inclusion_goethite_flakes_strawberry', 'inclusion_lepidocrocite_threads_strawberry', 'inclusion_mica_sparkles_strawberry'],
    healingProperties: ['prop_love_joy', 'prop_amplifies_intentions', 'prop_soothing_energy', 'prop_self_love_understanding'],
    chakra: ['chakra_heart', 'chakra_root'],
    element: ['element_earth', 'element_fire'],
    zodiac: ['zodiac_libra', 'zodiac_aries', 'zodiac_scorpio'],
  },
  Sunstone: {
    displayName: '太阳石 (Sunstone)',
    englishName: 'Sunstone',
    availableColors: ['Orange', 'Red-Orange', 'Yellow', 'Brownish Orange', 'Pink', 'Peach', 'Green (rare)', 'Colorless with Aventurescence'],
    specificInclusions: ['inclusion_hematite_platelets_sunstone_specific', 'inclusion_goethite_platelets_sunstone_specific', 'inclusion_copper_platelets_sunstone_specific', 'inclusion_aventurescence_schiller_sunstone', 'inclusion_zircon_crystals_sunstone'],
    healingProperties: ['prop_leadership_joy', 'prop_vitality_energy', 'prop_empowerment_luck', 'prop_optimism_confidence'],
    chakra: ['chakra_sacral', 'chakra_solarPlexus'],
    element: ['element_fire'],
    zodiac: ['zodiac_leo', 'zodiac_libra', 'zodiac_sagittarius'],
  }
};

