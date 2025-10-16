import json
from pathlib import Path

BASE_KEYWORD_PAIRS = """
희망|Hope
위안|Comfort
자기애|Self-love
신비|Mystery
절제의미|Meaning of restraint
후회없는청춘|Youth without regret
차분한사랑|Calm love
존경|Respect
지도력|Leadership
용기|Courage
순진무구|Innocence
천진난만|Childlike purity
사랑의고백|Confession of love
매혹|Fascination
진실한사랑|True love
성실|Sincerity
수줍은사랑|Shy love
작은행복|Simple happiness
인내|Patience
굳건함|Steadfastness
견고한우정|Steadfast friendship
믿음|Trust
뛰어난매력|Captivating charm
우아함|Elegance
자기주의|Self-interest
고결함|Nobility
내성적|Introversion
수줍음|Shyness
엄격|Strictness
독립심|Independence
승부|Competitive spirit
도전|Challenge
애정|Affection
친근함|Friendliness
억측|Speculation
상상력|Imagination
불로장수|Longevity
용감함|Bravery
순수함|Purity
우정|Friendship
모성애|Motherly love
보호|Protection
순종|Obedience
행운|Luck
섬세한사랑|Delicate love
기쁨|Joy
순진|Naivete
소박함|Simplicity
예민한마음|Sensitive heart
섬세함|Delicacy
게으름없는마음|Diligent spirit
활기|Vibrancy
대담함|Boldness
겸손|Humility
다가올행복|Happiness to come
청춘의환희|Youthful delight
열정|Passion
젊은날의고뇌|Trials of youth
평범|Ordinariness
조화|Harmony
불타는마음|Burning heart
돌보지않는아름다움|Unadorned beauty
자연미|Natural beauty
사랑스러움|Lovableness
가사에근면|Domestic diligence
성실함|Faithfulness
나를잊지말아요|Forget-me-not
절실한사랑|Earnest love
비밀|Secret
사랑의속삭임|Whispers of love
고귀함|Dignity
영광|Glory
불멸|Immortality
동정|Compassion
연민|Sympathy
가련미의극치|Peak of delicate beauty
청초함|Graceful purity
끈기|Perseverance
역경에굴하지않는강인함|Strength against adversity
웅대함|Grandeur
그대를위해살다|Living for you
승리|Victory
친숙한자연|Familiar nature
자유로움|Freedom
아름다운인격|Beautiful character
천진함|Naivety
붙임성|Sociability
환대|Hospitality
커다란희망|Great hope
야심|Ambition
애국심|Patriotism
어디서나성공|Success everywhere
섬세한아름다움|Delicate beauty
아가씨의수줍음|Maidenly shyness
첫사랑|First love
즐거운추억|Happy memories
영원한사랑|Eternal love
변덕스러운사랑|Fickle love
매력|Charm
추억|Remembrance
영원한행복|Everlasting happiness
순수|Purity
총명함|Brilliance
일치단결|Unity
화합|Concord
배려|Consideration
동정심|Empathy
자존심|Pride
고결|Purity of heart
순백|Snowy white
아름다움|Beauty
깊은후회|Deep regret
행복감|Sense of happiness
명랑|Cheerfulness
순수한마음|Pure heart
그대에게바친다|Dedicated to you
헌신|Devotion
넘치는활력|Overflowing energy
에너지|Energy
대담|Audacity
신뢰|Reliance
순박함|Guilelessness
사랑의슬픔|Sorrow of love
극락|Paradise
성숙|Maturity
내적열정|Inner passion
행복한가정|Happy family
화합의아름다움|Beauty of harmony
감사|Gratitude
기쁨의눈물|Tears of joy
소박한사랑|Simple love
싱그러운사랑|Fresh love
차분함|Calmness
소망|Wish
불멸의사랑|Undying love
향기로운사랑|Fragrant love
섬세한마음|Tender heart
가족애|Family love
풍요|Abundance
친절|Kindness
사랑|Love
영원한친구|Eternal friend
배려의마음|Considerate heart
미소|Smile
진정성|Authenticity
고귀한희생|Noble sacrifice
영감|Inspiration
고요함|Tranquility
하늘의축복|Blessing of heaven
성숙한사랑|Mature love
신성함|Divinity
자유로운정신|Free spirit
조용한존재|Quiet presence
기품|Grace
온화함|Gentleness
은은함|Soft glow
한없는사랑|Boundless love
고독|Solitude
강인함|Strength
낭만|Romance
내면의평화|Inner peace
사려깊음|Thoughtfulness
밝은미래|Bright future
믿음직함|Reliability
새로운시작|New beginning
침착함|Composure
건강|Health
영원한우정|Everlasting friendship
정열|Zeal
온화한마음|Tender heart
안정|Stability
진심어린사랑|Heartfelt love
수줍은고백|Bashful confession
부드러움|Softness
순진한영혼|Innocent soul
상냥함|Sweetness
주저없는사랑|Unhesitating love
치유|Healing
적응력|Adaptability
믿음의상징|Symbol of faith
꾸준함|Consistency
활짝핀사랑|Love in full bloom
영원한우애|Timeless fellowship
헌신적인사랑|Devoted love
희생|Sacrifice
이루어지는사랑|Love fulfilled
가정의행복|Family happiness
당신의미소|Your smile
축복|Blessing
생명력|Vitality
빛나는존재|Radiant presence
평화|Peace
그리움|Longing
명예|Honor
성취|Achievement
신비로운매력|Mysterious charm
풍성함|Richness
활짝피어나는행복|Happiness in full bloom
위대한사랑|Great love
과감함|Boldness
성공|Success
응원|Cheering
쾌활|Merriment
애착|Attachment
생기|Liveliness
가장밝은미소|Brightest smile
끝없는사랑|Endless love
무한한가능성|Infinite possibilities
자유로운영혼|Free soul
순수한애정|Pure affection
자애|Benevolence
자비|Mercy
목표달성|Goal achieved
헌신적봉사|Devoted service
단단한믿음|Unwavering faith
소망의빛|Light of hope
행복한동행|Joyful companionship
따뜻한시선|Warm gaze
포근함|Cozy warmth
자연의순리|Order of nature
감동|Deep impression
부드러운추억|Gentle memories
서정|Lyricism
열린마음|Open heart
낙관|Optimism
부활|Resurrection
위로|Consolation
헌신적인정성|Dedicated care
친밀감|Intimacy
애틋함|Tenderness
설렘|Fluttering heart
용서|Forgiveness
청결|Cleanliness
균형|Balance
어머니의품|Mother's embrace
따뜻한안식|Warm rest
기다림|Waiting
믿음의약속|Promise of faith
환희의노래|Song of joy
빛나는순수|Radiant purity
매혹적인향기|Alluring scent
영원한동반자|Eternal companion
마음의풍요|Richness of heart
자유의숨결|Breath of freedom
진실된약속|Sincere promise
부드러운위로|Gentle comfort
희생의사랑|Selfless love
거룩함|Sacredness
상냥한배려|Kind consideration
꿈꾸는마음|Dreaming heart
온화한시선|Gentle gaze
나눔|Sharing
힘찬시작|Vigorous start
온기|Warmth
평온|Serenity
순백의기억|Snow-white memory
따뜻한인연|Warm connection
아련한추억|Faint memories
늘곁에|Always by your side
낙천|Carefree spirit
단아함|Neat grace
하늘빛사랑|Sky-blue love
은은한기쁨|Subtle joy
포근한사랑|Snug love
섬세한위로|Delicate solace
자연의숨결|Breath of nature
따뜻한동행|Warm companionship
기쁨의기원|Wish for joy
축복의씨앗|Seed of blessing
활짝웃음|Beaming smile
맑은에너지|Clear energy
안정된사랑|Stable love
감미로운추억|Sweet memories
아늑함|Coziness
내면의힘|Inner strength
온화한미소|Gentle smile
수호|Guardianship
변치않는마음|Unchanging heart
우정의증표|Token of friendship
희망의빛|Light of hope
기쁨의전령|Herald of joy
순수한빛|Pure light
진실한약속|Earnest promise
포근한미소|Warm smile
자연의선물|Gift of nature
기쁨의선물|Gift of joy
지혜로운사랑|Wise love
끝없는인내|Endless patience
지켜주는사랑|Protective love
충만함|Fullness
마음의평화|Peace of mind
빛나는행운|Brilliant fortune
신뢰의동반자|Trusted companion
화목|Harmony
응원의메시지|Message of support
희망의씨앗|Seed of hope
온화한온기|Gentle warmth
다정한손길|Kind touch
사랑의안식처|Haven of love
따뜻한숨결|Warm breath
기쁨의울림|Echo of joy
작은행복|Little happiness
변치않는우정|Unfading friendship
은은한미소|Soft smile
하늘의은총|Grace of heaven
행복의속삭임|Whisper of happiness
안심|Relief
소중한추억|Precious memories
생명의숨결|Breath of life
희망의약속|Promise of hope
기쁨의꽃|Flower of joy
자애로운마음|Kindly heart
부드러운손길|Gentle touch
평화로운쉼|Peaceful rest
자연의조화|Harmony of nature
희망찬미래|Hopeful future
꿈의씨앗|Seed of dreams
즐거운설렘|Joyful anticipation
행복의설렘|Thrill of happiness
환한미소|Radiant smile
빛나는희망|Shining hope
희망의미소|Smile of hope
따뜻한빛|Warm light
언제나함께|Always together
햇살같은사랑|Sunlit love
포근한시간|Cozy moments
평화로운마음|Peaceful heart
영원한연결|Eternal connection
자연의빛|Light of nature
온화한숨결|Gentle breath
사랑의예감|Premonition of love
자비로운마음|Merciful heart
마음의여유|Ease of heart
훈훈함|Heartwarming feeling
따뜻한포옹|Warm embrace
행복한환영|Joyful welcome
은은한향기|Subtle fragrance
부드러운숨결|Soft breath
포근한품|Cuddling warmth
영원한약속|Eternal promise
안정된온기|Steady warmth
순수한소망|Pure wish
기쁨의약속|Promise of joy
희망의향기|Fragrance of hope
따뜻한약속|Warm promise
위로의별|Star of comfort
평안|Calm peace
넉넉함|Generosity
포근한꿈|Cozy dream
행복한기억|Happy memory
자연의포옹|Embrace of nature
감싸는사랑|Embracing love
포근한빛|Gentle light
포근한숨|Soft sigh
살포시안심|Gentle reassurance
소중한인연|Precious bond
따뜻한기억|Warm memory
변치않는사랑|Unfading love
소소한기쁨|Small joys
잔잔한행복|Serene happiness
사랑의기다림|Waiting for love
사랑의기원|Prayer of love
따뜻한숨|Warm sigh
희망의숨결|Breath of hope
설렘의순간|Moment of fluttering
온화한기억|Gentle memory
기쁨의빛|Light of joy
사랑의기억|Memory of love
행복의기억|Memory of happiness
햇살|Sunshine
행복한바람|Joyful breeze
포근한바람|Gentle breeze
따뜻한바람|Warm breeze
기쁜소식|Good news
행복한소식|Happy news
바람|Breeze
기쁨의노래|Song of joy
행복의노래|Song of happiness
애정의노래|Song of affection
아름다운추억|Beautiful memories
소중한추억|Treasured memories
환한빛|Radiant light
은은한빛|Soft light
맑은빛|Clear light
햇살가득|Full of sunlight
사랑스러운향기|Lovely scent
따뜻한향기|Warm scent
향기로운추억|Fragrant memories
좋은추억|Good memories
포근한추억|Cozy memories
기억의향기|Scent of memory
이루어질사랑|Love to come true
영원한기대|Eternal anticipation
따뜻한온기|Warm comfort
잔잔한온기|Gentle warmth
온화한온기|Mild warmth
희망의온기|Warmth of hope
포근한온기|Snug warmth
따뜻한온기|Toasty warmth
다정한온기|Tender warmth
향긋한온기|Aromatic warmth
사랑의온기|Warmth of love
빛나는온기|Radiant warmth
희망의숨|Breath of hope
따뜻한숨결|Warm breath
사랑의숨결|Breath of love
기쁨의숨결|Breath of joy
행복의숨결|Breath of happiness
부드러운숨결|Gentle breath
편안한숨결|Restful breath
평화의숨결|Breath of peace
온화한숨결|Mild breath
기쁨의감정|Feeling of joy
행복의감정|Feeling of happiness
사랑의감정|Feeling of love
설렘의감정|Feeling of flutter
희망의감정|Feeling of hope
따뜻한감정|Warm feeling
포근한감정|Cozy feeling
잔잔한감정|Calm feeling
부드러운감정|Soft feeling
밝은감정|Bright feeling
사랑의감각|Sense of love
행복의감각|Sense of happiness
희망의감각|Sense of hope
기쁨의감각|Sense of joy
포근한감각|Cozy sense
따뜻한감각|Warm sense
잔잔한감각|Gentle sense
온화한감각|Mild sense
빛나는감각|Radiant sense
행복한시간|Happy time
기쁜시간|Joyful time
사랑의시간|Time of love
설렘의시간|Time of anticipation
희망의시간|Time of hope
따뜻한시간|Warm time
포근한시간|Snug time
잔잔한시간|Calm time
온화한시간|Gentle time
빛나는시간|Radiant time
사랑의순간|Moment of love
행복의순간|Moment of happiness
희망의순간|Moment of hope
기쁨의순간|Moment of joy
따뜻한순간|Warm moment
포근한순간|Cozy moment
잔잔한순간|Serene moment
온화한순간|Gentle moment
빛나는순간|Shining moment
사랑의기쁨|Joy of love
행복의기쁨|Joy of happiness
희망의기쁨|Joy of hope
기쁨의기쁨|Joyful joy
따뜻한기쁨|Warm joy
포근한기쁨|Cozy joy
잔잔한기쁨|Gentle joy
온화한기쁨|Mild joy
빛나는기쁨|Radiant joy
"""

ADDITIONAL_KEYWORD_PAIRS = """
추도|Remembrance
사랑의망각|Love forgotten
죽음도아깝지않음|Love worth dying for
미덕|Virtue
상쾌함|Freshness
반드시올행복|Happiness sure to come
약속|Promise
무변화|Unchanging
불변|Immutable
한없는즐거움|Boundless delight
행복|Happiness
인생의출발|Beginning of life
은혜|Grace
정열적인사랑|Passionate love
아름다운매력|Beautiful charm
연결|Connection
순결|Chastity
도움|Help
품위|Dignity
괴롭히지말아요|Do not disturb me
인격자|Person of character
청초|Pure elegance
꿈길의사랑|Dreamlike love
망설임|Hesitation
진실한 사랑|Sincere love
기대|Anticipation
덧없는 사랑|Fleeting love
그대를 사랑해|I love you
풍부|Plenty
다산|Fertility
영원한 행복|Everlasting happiness
신명|Joyous spirit
애교|Playful charm
박애|Philanthropy
정신의 아름다움|Beauty of spirit
즐거운 추억|Joyful memories
와주세요|Please come
사랑의 노예|Slave of love
경쟁심|Competitiveness
넘치는 기쁨|Overflowing joy
훌륭함|Excellence
빼어남|Distinction
아름다운 눈동자|Beautiful eyes
멋진 결혼|Splendid marriage
나의 행복|My happiness
청명|Clarity
자유|Liberty
온화한 애정|Gentle affection
믿음직한 사랑|Trustworthy love
상냥하고 따뜻함|Kind warmth
결심|Resolution
진실|Truth
위엄|Majesty
권위|Authority
불타는 애정|Blazing affection
청순한 마음|Innocent heart
비할 바 없는 아름다움|Matchless beauty
슬픈 아름다움|Melancholic beauty
젊은 날의 슬픔|Sorrows of youth
천진난만함|Innocent liveliness
신탁|Oracle
사랑의 사도|Apostle of love
존중과 애정|Respect and affection
행복의 재래|Return of happiness
영원한 아름다움|Perennial beauty
사랑과 존경|Love and respect
정숙|Modesty
부끄러움|Bashfulness
유혹|Temptation
명성|Fame
사랑의 싹|Bud of love
유일한 사랑|Only love
승리의 맹세|Vow of victory
선언|Declaration
노련함|Skillfulness
헛된 사랑|Vain love
아름다움의 소유자|Bearer of beauty
빛나는 마음|Radiant heart
변화|Change
열렬한 마음|Fervent heart
첫사랑의 추억|Memory of first love
사랑이여 영원하라|May love be eternal
순애|Devoted love
사색|Contemplation
희귀한 사랑|Rare love
순수한 마음|Pure heart
사랑의 첫 감정|First feelings of love
강한 자제력|Strong self-control
솔직|Frankness
염려|Concern
운명|Destiny
아름다운 용모|Beautiful features
가련한 애정|Pitiful affection
믿는 자의 행복|Happiness of the faithful
사모하는 마음|Adoring heart
우아한 추억|Elegant memories
의협심|Chivalry
용감|Courageousness
열애|Ardent love
화려함|Splendor
추상|Abstraction
모정|Motherly affection
위험한 쾌락|Dangerous pleasure
활동력|Dynamism
고통|Pain
달성|Attainment
자유로운 마음|Free heart
사랑은 죽음보다 강하다|Love is stronger than death
열렬한 사랑|Fervent love
가족의 화합|Family harmony
아름다운 맹세|Beautiful vow
성스러운 사랑|Sacred love
그대가 있기에 행복이 있네|Happiness because of you
그대 있어 행복하오|Happy because you exist
사랑의 인연|Destined love
태만|Negligence
나태|Laziness
욕망|Desire
수다쟁이|Chatterbox
망각|Forgetfulness
잠|Sleep
자연애|Love of nature
풍부한 향기|Rich fragrance
이루어지는 행운|Luck fulfilled
우정|Friendship
친애|Affectionate love
사랑의 신앙|Faith in love
승낙|Consent
환희|Ecstasy
애정의약속|Promise of affection
사랑의행복|Happiness of love
근면|Diligence
감사하는마음|Grateful heart
열정적사랑|Passionate affection
온화한존재|Gentle presence
겸손한마음|Humble heart
절개|Integrity
맹세|Oath
변치않는사랑|Unchanging love
섬세한배려|Delicate consideration
빛나는우정|Shining friendship
포근한위로|Comforting warmth
성실한사랑|Faithful love
감성|Sensitivity
친밀|Closeness
따뜻한사랑|Warm love
성스러운감정|Sacred feeling
영원한기약|Promise forever
사랑의계절|Season of love
희망의계절|Season of hope
행복의계절|Season of happiness
고요한축복|Quiet blessing
소중한사랑|Treasured love
소망의별|Star of wish
꿈꾸는사랑|Dreaming love
영원한소원|Eternal wish
빛나는사랑|Radiant love
사랑의바람|Breeze of love
사랑의부름|Call of love
평온한숨|Peaceful sigh
희망의노래|Song of hope
자애로운시선|Affectionate gaze
기쁨의시선|Joyful gaze
미소의시선|Smiling gaze
부드러운빛|Gentle glow
사랑의향|Scent of love
안식|Rest
소망의숨결|Breath of wish
변함없는사랑|Steadfast love
사랑의숨|Breath of love
신뢰의숨결|Breath of trust
소망의숨|Breath of desire
위로의숨|Breath of comfort
평화의숨|Breath of peace
사랑의속삭임|Loving whispers
희망의속삭임|Whispers of hope
행복의속삭임|Whispers of joy
사랑의영혼|Soul of love
희망의영혼|Soul of hope
행복의영혼|Soul of happiness
사랑의감동|Touch of love
희망의감동|Touch of hope
행복의감동|Touch of happiness
사랑의선율|Melody of love
희망의선율|Melody of hope
행복의선율|Melody of happiness
"""

NAME_PAIRS = """
아이리스|Iris
제비꽃|Violet
페튜니아|Petunia
히아신스|Hyacinth
벚꽃|Cherry Blossom
편백나무|Hinoki Cypress
민트|Mint
백합|Lily
코스모스|Cosmos
클로버|Clover
양귀비|Poppy
금잔화|Calendula
대나무|Bamboo
포도나무|Grape Vine
칡|Kudzu
고사리|Fern
버섯|Mushroom
연꽃|Lotus
크로커스|Crocus
자귀나무|Silk Tree
사과나무|Apple Tree
미루나무|Poplar
안개꽃|Baby's Breath
올리브|Olive
철쭉|Azalea
팬지|Pansy
복숭아꽃|Peach Blossom
밀|Wheat
벼|Rice Plant
산딸기|Raspberry
블랙베리|Blackberry
참나무|Oak
원추리|Daylily
호두나무|Walnut Tree
미나리|Water Dropwort
완두콩|Pea
난초|Orchid
아욱|Mallow
등나무|Wisteria
싸리|Broom Tree
델피니움|Delphinium
빨간 장미|Red Rose
하얀 아네모네|White Anemone
자두|Plum
메꽃|Bindweed
서양란|Western Orchid
붓꽃|Iris Flower
모과나무|Quince Tree
더덕|Balloon Flower Root
페라고늄|Pelargonium
베고니아|Begonia
냉이|Shepherd's Purse
부레옥잠|Water Hyacinth
차나무|Tea Tree
애기동백|Camellia Sasanqua
프리뮬러|Primula
블루베리|Blueberry
뮤게|Lily of the Valley
스토크|Stock Flower
모란|Tree Peony
사과꽃|Apple Blossom
배|Pear
찔레|Wild Rose
耧斗菜|Columbine
스피irea|Spiraea
빨간 튤립|Red Tulip
酢浆草|Wood Sorrel
풍크시아|Fuchsia
잔디|Grass
자주개자리|Alfalfa
향수초|Heliotrope
하얀 라일락|White Lilac
하얀 매발톱꽃|White Columbine
리넨|Linen
향기별꽃|Saponaria
지기타리스|Foxglove
별꽃|Starflower
월하향|Night-blooming Jasmine
타임|Thyme
베로니카|Speedwell
샐비어|Sage
월견초|Evening Primrose
인동덩굴|Honeysuckle
산수유|Cornelian Cherry
홀리호크|Hollyhock
마편초|Vervain
유홍초|Cypress Vine
패션플라워|Passionflower
예수|Jesus
분홍 제라늄|Pink Geranium
쑥부쟁이|Aster
스냅드래곤|Snapdragon
목련|Magnolia
백목련|White Magnolia
태양|Sun
달|Moon
구스베리|Gooseberry
블랙커런트|Blackcurrant
캄파눌라|Campanula
감자|Potato
강아지풀|Foxtail
플록스|Phlox
채송화|Portulaca
투구꽃|Monkshood
토마토|Tomato
석죽|Pink Dianthus
얼레지|Dogtooth Violet
딱총나무|Elder Tree
쑥|Mugwort
다육식물|Succulent
린덴|Linden
피나무|Basswood
오이|Cucumber
수박|Watermelon
히비스커스|Hibiscus
헤더|Heather
영산홍|Korean Azalea
록로즈|Rock Rose
독말풀|Jimsonweed
미역취|Golden lace
대추야자|Date Palm
망고|Mango
백합나무|Tulip Tree
동자꽃|Catchfly
프리지어|Freesia
스파티필름|Peace Lily
몬스테라|Monstera
스타그래스|Star Grass
구기자|Goji Berry
복분자|Black Raspberry
아티초크|Artichoke
니코티아나|Flowering Tobacco
참나리|Tiger Lily
양지꽃|Cinquefoil
금련화|Marigold
오렌지꽃|Orange Blossom
겨자|Mustard
유채|Rapeseed
보라색 과꽃|Purple Aster
으아리|Clematis
포플러|Poplar
달리아|Dahlia
겐티아나|Gentian
칼루나|Heather Calluna
방울새풀|Canary Grass
귀리|Oat
단감|Sweet Persimmon
대봉|Large Persimmon
맨드라미|Cockscomb
비름|Amaranth
하얀 국화|White Chrysanthemum
복숭아|Peach
은행나무|Ginkgo Tree
맥주|Beer
삼|Hemp
야자수|Palm Tree
헤이즐넛|Hazelnut
도토리|Acorn
고수|Coriander
샐러리|Celery
딜|Dill
아니스|Anise
참외|Korean Melon
크랜베리|Cranberry
노란 국화|Yellow Chrysanthemum
바질|Basil
와인|Wine
봉선화|Impatiens
임페티엔스|Busy Lizzie
물옥잠|Water Lettuce
사피니아|Sufinia Petunia
카라|Calla Lily
콩과|Legume
박|Gourd
유향|Frankincense
향나무|Juniper
동백|Camellia
라임|Lime
레몬밤|Lemon Balm
헬레보루스|Hellebore
보리지|Borage
옻나무|Lacquer Tree
국화과|Chrysanthemum Family
단풍|Maple
은행|Ginkgo
돼지풀|Ragweed
돌단풍|Foamflower
억새|Silver Grass
하얀 동백|White Camellia
면|Cotton
자작나무|Birch
코코넛|Coconut
천일홍|Globe Amaranth
양버즘나무|London Plane Tree
호랑가시나무|Holly
방울토마토|Cherry Tomato
"""


def parse_pairs(text):
    mapping = {}
    for line in text.strip().splitlines():
        if not line.strip():
            continue
        try:
            source, target = line.split('|', 1)
        except ValueError:
            raise ValueError(f"Invalid line: {line!r}")
        mapping[source.strip()] = target.strip()
    return mapping

keyword_translations = parse_pairs(BASE_KEYWORD_PAIRS)
keyword_translations.update(parse_pairs(ADDITIONAL_KEYWORD_PAIRS))
extra_path = Path('data/keyword_pairs_extra.txt')
if extra_path.exists():
    keyword_translations.update(parse_pairs(extra_path.read_text()))
name_translations = parse_pairs(NAME_PAIRS)

output = {
    "keywords": keyword_translations,
    "names": name_translations,
}

Path('data').mkdir(exist_ok=True)
Path('data/birthflower-translations-en.json').write_text(json.dumps(output, ensure_ascii=False, indent=2))
