import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import Vivify from '../spells/Vivify';
import ManaTea from './ManaTea';

class RenewingMistDuringManaTea extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    vivify: Vivify,
    manaTea: ManaTea,
  };

  protected abilityTracker!: AbilityTracker;
  protected vivify!: Vivify;
  protected manaTea!: ManaTea;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MANA_TEA_TALENT.id);
  }

  get avgRemDuringMT() {
    return this.vivify.remDuringManaTea / (this.manaTea.casts.get('Vivify') || 0) || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.avgRemDuringMT,
      isLessThan: {
        minor: 2,
        average: 1.5,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          During <SpellLink id={SPELLS.MANA_TEA_TALENT.id} /> you should have a minimum of two{' '}
          <SpellLink id={SPELLS.RENEWING_MIST.id} /> out to maximize your healing during the buff.
        </>,
      )
        .icon(SPELLS.MANA_TEA_TALENT.icon)
        .actual(
          `${this.avgRemDuringMT.toFixed(2)}${t({
            id: 'monk.mistweaver.suggestions.renewingMistDuringManaTea.avgRenewingMists',
            message: ` average Renewing Mists during Mana Tea`,
          })}`,
        )
        .recommended(`${recommended} average Renewing Mists recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(30)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={<>This is the average number of Renewing Mists active during Mana Tea</>}
      >
        <BoringValueText
          label={
            <>
              <SpellIcon id={SPELLS.MANA_TEA_TALENT.id} /> Average Renewing Mists
            </>
          }
        >
          <>{this.avgRemDuringMT.toFixed(2)}</>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default RenewingMistDuringManaTea;
