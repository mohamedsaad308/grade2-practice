import React from 'react';

/**
 * Visual illustrations for Grade 2 Measuring Revision:
 * 1. 'ruler': Centimeter ruler (0 to 15 cm) with a single object measured on top.
 * 2. 'ruler_multi': Centimeter ruler with Crayon (7cm), Glue Stick (9cm), and Scissors (12cm).
 * 3. 'compare_trees': Tree A (4 m) vs Tree B (3 m) with height arrows.
 * 4. 'compare_cars': Car C (2 m) vs Car D (3 m) with length arrows.
 * 5. 'compare_trucks': Truck A (3 m), Truck B (4 m), Truck C (6 m) with length arrows.
 * 6. 'estimate_card': Visual card for estimating objects in inches vs feet.
 */
export default function MeasuringVisual({ visual }) {
  if (!visual) return null;

  const type = typeof visual === 'string' ? visual : visual.type;

  // Single Object Ruler (0 to 15 cm)
  if (type === 'ruler') {
    const {
      lengthCm = 10,
      startCm = 0,
      maxCm = 15,
      objectName = 'Object',
      objectEmoji = '📏',
      objectColor = '#3B82F6'
    } = visual;

    const rulerX = 40;
    const rulerY = 65;
    const rulerWidth = 450;
    const cmStep = rulerWidth / maxCm; // 30px per cm
    const startX = rulerX + startCm * cmStep;
    const endX = rulerX + lengthCm * cmStep;
    const objWidth = Math.max(8, endX - startX);

    return (
      <div className="measuring-visual-container" role="img" aria-label={`Ruler measuring ${objectName} from 0 to ${lengthCm} cm`}>
        <div className="measuring-visual-header">
          <span className="measuring-badge">📏 Centimeter Ruler (cm)</span>
          <span className="measuring-obj-badge">{objectEmoji} {objectName}</span>
        </div>
        <svg viewBox="0 0 530 135" className="measuring-svg ruler-svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="rulerWood" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FEF3C7" />
              <stop offset="100%" stopColor="#FDE68A" />
            </linearGradient>
            <linearGradient id="pencilYellow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FCD34D" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <linearGradient id="blueBlockGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient id="redCrayonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F87171" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
            <linearGradient id="eraserGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F472B6" />
              <stop offset="50%" stopColor="#EC4899" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
          </defs>

          {/* Dotted indicator line from end of object to ruler mark */}
          <line
            x1={endX}
            y1={15}
            x2={endX}
            y2={rulerY + 28}
            stroke="#DC2626"
            strokeWidth="2"
            strokeDasharray="4,3"
          />

          {/* Start alignment guide line at 0 */}
          <line
            x1={startX}
            y1={15}
            x2={startX}
            y2={rulerY + 28}
            stroke="#059669"
            strokeWidth="2"
            strokeDasharray="4,3"
          />

          {/* Object on top of ruler */}
          {visual.objectType === 'pencil' ? (
            <g transform={`translate(${startX}, 25)`}>
              {/* Eraser */}
              <rect x="0" y="2" width={Math.min(22, objWidth * 0.12)} height="22" rx="3" fill="#F472B6" />
              <rect x={Math.min(20, objWidth * 0.11)} y="2" width="6" height="22" fill="#9CA3AF" />
              {/* Pencil Body */}
              <rect
                x={Math.min(26, objWidth * 0.14)}
                y="2"
                width={Math.max(10, objWidth - 50)}
                height="22"
                fill="url(#pencilYellow)"
                stroke="#D97706"
                strokeWidth="1"
              />
              <line x1={Math.min(26, objWidth * 0.14)} y1="9" x2={objWidth - 24} y2="9" stroke="#FDE68A" strokeWidth="1.5" />
              <line x1={Math.min(26, objWidth * 0.14)} y1="17" x2={objWidth - 24} y2="17" stroke="#B45309" strokeWidth="1.5" />
              {/* Sharpened tip */}
              <polygon
                points={`${objWidth - 24},2 ${objWidth},13 ${objWidth - 24},24`}
                fill="#FDE68A"
                stroke="#D97706"
                strokeWidth="1"
              />
              {/* Graphite point */}
              <polygon
                points={`${objWidth - 8},9.5 ${objWidth},13 ${objWidth - 8},16.5`}
                fill="#1F2937"
              />
            </g>
          ) : visual.objectType === 'blue_block' ? (
            <g transform={`translate(${startX}, 25)`}>
              <rect x="0" y="2" width={objWidth} height="24" rx="4" fill="url(#blueBlockGrad)" stroke="#1D4ED8" strokeWidth="1.5" />
              <line x1="4" y1="6" x2={objWidth - 4} y2="6" stroke="#93C5FD" strokeWidth="1.5" />
              <text x={objWidth / 2} y="18" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">BLUE BLOCK</text>
            </g>
          ) : visual.objectType === 'red_crayon' ? (
            <g transform={`translate(${startX}, 26)`}>
              <rect x="0" y="2" width={objWidth - 18} height="22" rx="4" fill="url(#redCrayonGrad)" stroke="#991B1B" strokeWidth="1.5" />
              <polygon points={`${objWidth - 18},2 ${objWidth},13 ${objWidth - 18},24`} fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
              <ellipse cx={(objWidth - 18) / 2} cy="13" rx={Math.min(32, objWidth / 3)} ry="7" fill="#F87171" opacity="0.6" />
              <text x={(objWidth - 18) / 2} y="17" fill="#7F1D1D" fontSize="10" fontWeight="bold" textAnchor="middle">RED</text>
            </g>
          ) : visual.objectType === 'eraser' ? (
            <g transform={`translate(${startX}, 26)`}>
              <rect x="0" y="2" width={objWidth} height="22" rx="5" fill="url(#eraserGrad)" stroke="#6B7280" strokeWidth="1.5" />
              <line x1={objWidth / 2} y1="2" x2={objWidth / 2} y2="24" stroke="#FFFFFF" strokeWidth="1.5" />
            </g>
          ) : visual.objectType === 'line' ? (
            <g transform={`translate(${startX}, 35)`}>
              <line x1="0" y1="0" x2={objWidth} y2="0" stroke="#111827" strokeWidth="4" strokeLinecap="round" />
              <circle cx="0" cy="0" r="3" fill="#111827" />
              <circle cx={objWidth} cy="0" r="3" fill="#111827" />
            </g>
          ) : (
            <g transform={`translate(${startX}, 28)`}>
              <rect x="0" y="0" width={objWidth} height="18" rx="4" fill={objectColor} stroke="#1E3A8A" strokeWidth="1.5" />
              <text x={objWidth / 2} y="13" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">
                {objectName.toUpperCase()}
              </text>
            </g>
          )}

          {/* Wooden / Classroom Ruler Body */}
          <rect
            x={rulerX - 10}
            y={rulerY}
            width={rulerWidth + 24}
            height="54"
            rx="6"
            fill="url(#rulerWood)"
            stroke="#B45309"
            strokeWidth="2"
          />

          {/* Unit Label */}
          <text x={rulerX - 2} y={rulerY + 44} fill="#92400E" fontSize="11" fontWeight="bold">cm</text>

          {/* Centimeter Ticks & Numbers (0 to maxCm) */}
          {Array.from({ length: maxCm + 1 }, (_, i) => {
            const tx = rulerX + i * cmStep;
            return (
              <g key={i}>
                {/* Major cm mark */}
                <line x1={tx} y1={rulerY} x2={tx} y2={rulerY + 20} stroke="#78350F" strokeWidth={i === 0 || i === lengthCm ? 2.5 : 1.5} />
                {/* Number */}
                <text
                  x={tx}
                  y={rulerY + 34}
                  fill={i === lengthCm ? '#DC2626' : '#78350F'}
                  fontSize={i === lengthCm ? '13' : '11'}
                  fontWeight={i === lengthCm ? 'bold' : 'normal'}
                  textAnchor="middle"
                >
                  {i}
                </text>
                {/* Half cm tick */}
                {i < maxCm && (
                  <line x1={tx + cmStep / 2} y1={rulerY} x2={tx + cmStep / 2} y2={rulerY + 12} stroke="#B45309" strokeWidth="1" />
                )}
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  // Multi-object ruler (Worksheet 6: Crayon 7cm, Glue Stick 9cm, Scissors 12cm)
  if (type === 'ruler_multi') {
    const rulerX = 45;
    const rulerY = 120;
    const rulerWidth = 440;
    const cmStep = rulerWidth / 15;

    return (
      <div className="measuring-visual-container" role="img" aria-label="Ruler comparing crayon (7cm), glue stick (9cm), and scissors (12cm)">
        <div className="measuring-visual-header">
          <span className="measuring-badge">📏 Practice: Measuring & Comparing Objects</span>
        </div>
        <svg viewBox="0 0 530 190" className="measuring-svg ruler-svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="multiRulerWood" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FEF3C7" />
              <stop offset="100%" stopColor="#FDE68A" />
            </linearGradient>
            <linearGradient id="greenCrayon" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4ADE80" />
              <stop offset="100%" stopColor="#16A34A" />
            </linearGradient>
            <linearGradient id="glueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="25%" stopColor="#F97316" />
              <stop offset="25%" stopColor="#0284C7" />
              <stop offset="85%" stopColor="#0284C7" />
              <stop offset="85%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
          </defs>

          {/* Dotted lines dropping to ruler */}
          <line x1={rulerX} y1={15} x2={rulerX} y2={rulerY + 22} stroke="#10B981" strokeWidth="1.5" strokeDasharray="3,3" />
          <line x1={rulerX + 7 * cmStep} y1={20} x2={rulerX + 7 * cmStep} y2={rulerY + 22} stroke="#16A34A" strokeWidth="2" strokeDasharray="3,3" />
          <line x1={rulerX + 9 * cmStep} y1={52} x2={rulerX + 9 * cmStep} y2={rulerY + 22} stroke="#0284C7" strokeWidth="2" strokeDasharray="3,3" />
          <line x1={rulerX + 12 * cmStep} y1={84} x2={rulerX + 12 * cmStep} y2={rulerY + 22} stroke="#DC2626" strokeWidth="2" strokeDasharray="3,3" />

          {/* Object 1: Crayon (0 to 7 cm) */}
          <g transform={`translate(${rulerX}, 18)`}>
            <rect x="0" y="0" width={7 * cmStep - 15} height="18" rx="3" fill="url(#greenCrayon)" stroke="#15803D" strokeWidth="1" />
            <polygon points={`${7 * cmStep - 15},0 ${7 * cmStep},9 ${7 * cmStep - 15},18`} fill="#22C55E" stroke="#15803D" strokeWidth="1" />
            <text x="6" y="13" fill="#FFFFFF" fontSize="10" fontWeight="bold">🖍️ Crayon</text>
            <text x={7 * cmStep + 6} y="13" fill="#15803D" fontSize="11" fontWeight="bold">7 cm</text>
          </g>

          {/* Object 2: Glue Stick (0 to 9 cm) */}
          <g transform={`translate(${rulerX}, 50)`}>
            <rect x="0" y="0" width={9 * cmStep} height="20" rx="4" fill="url(#glueGrad)" stroke="#0369A1" strokeWidth="1" />
            <text x="6" y="14" fill="#FFFFFF" fontSize="10" fontWeight="bold">GLUE STICK</text>
            <text x={9 * cmStep + 6} y="15" fill="#0369A1" fontSize="11" fontWeight="bold">9 cm</text>
          </g>

          {/* Object 3: Scissors (0 to 12 cm) */}
          <g transform={`translate(${rulerX}, 82)`}>
            {/* Handles */}
            <circle cx="12" cy="7" r="9" fill="none" stroke="#EF4444" strokeWidth="4" />
            <circle cx="12" cy="19" r="9" fill="none" stroke="#EF4444" strokeWidth="4" />
            {/* Blades */}
            <polygon points={`22,10 ${12 * cmStep},13 22,14`} fill="#9CA3AF" stroke="#6B7280" strokeWidth="1" />
            <polygon points={`22,16 ${12 * cmStep},13 22,17`} fill="#D1D5DB" stroke="#6B7280" strokeWidth="1" />
            <circle cx="24" cy="13" r="2.5" fill="#374151" />
            <text x="32" y="11" fill="#DC2626" fontSize="10" fontWeight="bold">✂️ Scissors</text>
            <text x={12 * cmStep + 6} y="16" fill="#DC2626" fontSize="11" fontWeight="bold">12 cm</text>
          </g>

          {/* Ruler Body */}
          <rect x={rulerX - 8} y={rulerY} width={rulerWidth + 18} height="48" rx="5" fill="url(#multiRulerWood)" stroke="#B45309" strokeWidth="2" />
          <text x={rulerX - 4} y={rulerY + 38} fill="#92400E" fontSize="10" fontWeight="bold">cm</text>

          {/* Ticks 0 to 15 */}
          {Array.from({ length: 16 }, (_, i) => {
            const tx = rulerX + i * cmStep;
            const isHighlight = i === 7 || i === 9 || i === 12;
            return (
              <g key={i}>
                <line x1={tx} y1={rulerY} x2={tx} y2={rulerY + (isHighlight ? 20 : 16)} stroke="#78350F" strokeWidth={isHighlight ? 2.5 : 1.2} />
                <text
                  x={tx}
                  y={rulerY + 32}
                  fill={isHighlight ? '#DC2626' : '#78350F'}
                  fontSize={isHighlight ? '12' : '10'}
                  fontWeight={isHighlight ? 'bold' : 'normal'}
                  textAnchor="middle"
                >
                  {i}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  // Comparing Trees (Worksheet 3: Tree A is 4 m, Tree B is 3 m)
  if (type === 'compare_trees') {
    return (
      <div className="measuring-visual-container" role="img" aria-label="Tree A is 4 meters tall, Tree B is 3 meters tall">
        <div className="measuring-visual-header">
          <span className="measuring-badge">🌳 Measuring & Comparing Meters</span>
        </div>
        <svg viewBox="0 0 460 210" className="measuring-svg compare-svg" preserveAspectRatio="xMidYMid meet">
          {/* Ground */}
          <line x1="30" y1="180" x2="430" y2="180" stroke="#15803D" strokeWidth="4" strokeLinecap="round" />

          {/* Tree A (4 m) */}
          <g transform="translate(60, 20)">
            {/* Trunk */}
            <rect x="52" y="90" width="22" height="70" fill="#78350F" rx="3" />
            {/* Foliage */}
            <circle cx="63" cy="70" r="42" fill="#15803D" />
            <circle cx="45" cy="55" r="30" fill="#16A34A" />
            <circle cx="80" cy="55" r="30" fill="#22C55E" />
            <circle cx="63" cy="35" r="28" fill="#4ADE80" />
            {/* Label */}
            <text x="63" y="178" fill="#1F2937" fontSize="13" fontWeight="bold" textAnchor="middle">Tree A</text>

            {/* Height Arrow: 4 m */}
            <line x1="125" y1="10" x2="125" y2="160" stroke="#2563EB" strokeWidth="2.5" />
            <polygon points="121,15 125,5 129,15" fill="#2563EB" />
            <polygon points="121,155 125,165 129,155" fill="#2563EB" />
            <rect x="133" y="75" width="42" height="24" rx="4" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1.5" />
            <text x="154" y="91" fill="#1D4ED8" fontSize="13" fontWeight="bold" textAnchor="middle">4 m</text>
          </g>

          {/* Tree B (3 m) */}
          <g transform="translate(260, 60)">
            {/* Trunk */}
            <rect x="44" y="65" width="18" height="55" fill="#78350F" rx="3" />
            {/* Foliage */}
            <circle cx="53" cy="50" r="34" fill="#15803D" />
            <circle cx="38" cy="38" r="24" fill="#16A34A" />
            <circle cx="68" cy="38" r="24" fill="#22C55E" />
            <circle cx="53" cy="22" r="22" fill="#4ADE80" />
            {/* Label */}
            <text x="53" y="138" fill="#1F2937" fontSize="13" fontWeight="bold" textAnchor="middle">Tree B</text>

            {/* Height Arrow: 3 m */}
            <line x1="105" y1="5" x2="105" y2="120" stroke="#2563EB" strokeWidth="2.5" />
            <polygon points="101,12 105,2 109,12" fill="#2563EB" />
            <polygon points="101,113 105,123 109,113" fill="#2563EB" />
            <rect x="113" y="52" width="42" height="24" rx="4" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1.5" />
            <text x="134" y="68" fill="#1D4ED8" fontSize="13" fontWeight="bold" textAnchor="middle">3 m</text>
          </g>
        </svg>
      </div>
    );
  }

  // Comparing Cars (Worksheet 3: Car C is 2 m, Car D is 3 m)
  if (type === 'compare_cars') {
    return (
      <div className="measuring-visual-container" role="img" aria-label="Car C is 2 meters long, Car D is 3 meters long">
        <div className="measuring-visual-header">
          <span className="measuring-badge">🚗 Measuring & Comparing Meters</span>
        </div>
        <svg viewBox="0 0 460 180" className="measuring-svg compare-svg" preserveAspectRatio="xMidYMid meet">
          {/* Car C (2 m) */}
          <g transform="translate(30, 20)">
            {/* Body */}
            <path d="M 15 45 Q 25 25, 45 22 L 75 22 Q 95 25, 105 45 L 115 48 Q 118 56, 110 58 L 10 58 Q 5 56, 15 45 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />
            {/* Window */}
            <polygon points="35,42 45,26 75,26 82,42" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1" />
            {/* Wheels */}
            <circle cx="35" cy="58" r="11" fill="#1F2937" />
            <circle cx="35" cy="58" r="5" fill="#9CA3AF" />
            <circle cx="90" cy="58" r="11" fill="#1F2937" />
            <circle cx="90" cy="58" r="5" fill="#9CA3AF" />
            <text x="62" y="86" fill="#1F2937" fontSize="12" fontWeight="bold" textAnchor="middle">Car C</text>

            {/* Length Arrow: 2 m */}
            <line x1="10" y1="102" x2="115" y2="102" stroke="#2563EB" strokeWidth="2.5" />
            <polygon points="17,98 7,102 17,106" fill="#2563EB" />
            <polygon points="108,98 118,102 108,106" fill="#2563EB" />
            <rect x="42" y="112" width="42" height="22" rx="4" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1.5" />
            <text x="63" y="127" fill="#1D4ED8" fontSize="12" fontWeight="bold" textAnchor="middle">2 m</text>
          </g>

          {/* Car D (3 m) */}
          <g transform="translate(220, 10)">
            {/* Body - Longer Car */}
            <path d="M 20 55 Q 35 25, 65 20 L 135 20 Q 165 25, 180 55 L 195 58 Q 198 68, 188 70 L 10 70 Q 5 68, 20 55 Z" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1.5" />
            {/* Windows */}
            <polygon points="50,52 65,26 95,26 95,52" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1" />
            <polygon points="102,52 102,26 135,26 148,52" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1" />
            {/* Wheels */}
            <circle cx="48" cy="70" r="14" fill="#1F2937" />
            <circle cx="48" cy="70" r="6" fill="#9CA3AF" />
            <circle cx="155" cy="70" r="14" fill="#1F2937" />
            <circle cx="155" cy="70" r="6" fill="#9CA3AF" />
            <text x="102" y="100" fill="#1F2937" fontSize="12" fontWeight="bold" textAnchor="middle">Car D</text>

            {/* Length Arrow: 3 m */}
            <line x1="10" y1="112" x2="195" y2="112" stroke="#2563EB" strokeWidth="2.5" />
            <polygon points="17,108 7,112 17,116" fill="#2563EB" />
            <polygon points="188,108 198,112 188,116" fill="#2563EB" />
            <rect x="81" y="122" width="42" height="22" rx="4" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1.5" />
            <text x="102" y="137" fill="#1D4ED8" fontSize="12" fontWeight="bold" textAnchor="middle">3 m</text>
          </g>
        </svg>
      </div>
    );
  }

  // Comparing Trucks (Worksheet 3: Truck A is 3 m, Truck B is 4 m, Truck C is 6 m)
  if (type === 'compare_trucks') {
    return (
      <div className="measuring-visual-container" role="img" aria-label="Truck A is 3 meters, Truck B is 4 meters, Truck C is 6 meters">
        <div className="measuring-visual-header">
          <span className="measuring-badge">🚚 Comparing Trucks in Meters</span>
        </div>
        <svg viewBox="0 0 520 220" className="measuring-svg compare-svg" preserveAspectRatio="xMidYMid meet">
          {/* Ground */}
          <line x1="15" y1="180" x2="505" y2="180" stroke="#6B7280" strokeWidth="3" strokeLinecap="round" />

          {/* Truck A (3 m) */}
          <g transform="translate(15, 65)">
            <rect x="0" y="15" width="55" height="35" rx="3" fill="#F97316" stroke="#C2410C" strokeWidth="1.5" />
            <rect x="55" y="25" width="25" height="25" rx="3" fill="#F97316" stroke="#C2410C" strokeWidth="1.5" />
            <rect x="62" y="28" width="14" height="12" fill="#BAE6FD" />
            <circle cx="20" cy="52" r="9" fill="#1F2937" />
            <circle cx="68" cy="52" r="9" fill="#1F2937" />
            <text x="40" y="76" fill="#1F2937" fontSize="11" fontWeight="bold" textAnchor="middle">Truck A</text>
            <line x1="0" y1="90" x2="80" y2="90" stroke="#2563EB" strokeWidth="2" />
            <polygon points="6,87 0,90 6,93" fill="#2563EB" />
            <polygon points="74,87 80,90 74,93" fill="#2563EB" />
            <rect x="22" y="96" width="36" height="18" rx="3" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1" />
            <text x="40" y="109" fill="#1D4ED8" fontSize="10" fontWeight="bold" textAnchor="middle">3 m</text>
          </g>

          {/* Truck B (4 m) */}
          <g transform="translate(135, 65)">
            <rect x="0" y="32" width="75" height="18" rx="2" fill="#22C55E" stroke="#15803D" strokeWidth="1.5" />
            <rect x="75" y="15" width="35" height="35" rx="4" fill="#22C55E" stroke="#15803D" strokeWidth="1.5" />
            <rect x="85" y="20" width="18" height="14" fill="#BAE6FD" />
            <circle cx="25" cy="52" r="9" fill="#1F2937" />
            <circle cx="50" cy="52" r="9" fill="#1F2937" />
            <circle cx="95" cy="52" r="9" fill="#1F2937" />
            <text x="55" y="76" fill="#1F2937" fontSize="11" fontWeight="bold" textAnchor="middle">Truck B</text>
            <line x1="0" y1="90" x2="110" y2="90" stroke="#2563EB" strokeWidth="2" />
            <polygon points="6,87 0,90 6,93" fill="#2563EB" />
            <polygon points="104,87 110,90 104,93" fill="#2563EB" />
            <rect x="37" y="96" width="36" height="18" rx="3" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1" />
            <text x="55" y="109" fill="#1D4ED8" fontSize="10" fontWeight="bold" textAnchor="middle">4 m</text>
          </g>

          {/* Truck C (6 m - Longest Tractor Truck) */}
          <g transform="translate(285, 45)">
            <rect x="0" y="25" width="130" height="45" rx="4" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />
            <rect x="130" y="10" width="55" height="60" rx="5" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" />
            <rect x="145" y="18" width="28" height="22" fill="#BAE6FD" />
            <circle cx="30" cy="72" r="12" fill="#1F2937" />
            <circle cx="65" cy="72" r="12" fill="#1F2937" />
            <circle cx="155" cy="72" r="14" fill="#1F2937" />
            <text x="92" y="96" fill="#1F2937" fontSize="11" fontWeight="bold" textAnchor="middle">Truck C</text>
            <line x1="0" y1="110" x2="185" y2="110" stroke="#2563EB" strokeWidth="2" />
            <polygon points="6,107 0,110 6,113" fill="#2563EB" />
            <polygon points="179,107 185,110 179,113" fill="#2563EB" />
            <rect x="74" y="116" width="36" height="18" rx="3" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1" />
            <text x="92" y="129" fill="#1D4ED8" fontSize="10" fontWeight="bold" textAnchor="middle">6 m</text>
          </g>
        </svg>
      </div>
    );
  }

  // Object estimation visual card (Worksheets 1, 2, 5)
  if (type === 'estimate_card') {
    const {
      emoji = '📦',
      name = 'Object',
      categoryHint = 'Real-world object size',
      badge = 'Estimate Length'
    } = visual;

    return (
      <div className="measuring-visual-container estimate-card-container">
        <div className="measuring-visual-header">
          <span className="measuring-badge">🔍 {badge}</span>
        </div>
        <div className="estimate-object-card">
          <div className="estimate-object-icon-wrap">
            <span className="estimate-object-icon">{emoji}</span>
          </div>
          <div className="estimate-object-info">
            <h4 className="estimate-object-title">{name}</h4>
            <p className="estimate-object-hint">{categoryHint}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
