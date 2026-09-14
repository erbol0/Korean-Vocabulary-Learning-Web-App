// Restaurant work sentences - 100 practical sentences
export interface RestaurantSentence {
  id: string;
  korean: string;
  english: string;
  category: string;
  difficulty: 'beginner' | 'elementary' | 'intermediate';
}

export const RESTAURANT_SENTENCES: RestaurantSentence[] = [
  { id: "rs001", korean: "오늘은 제가 설거지할게요.", english: "I will do the dishes today.", category: "설거지", difficulty: "elementary" },
  { id: "rs002", korean: "접시를 먼저 헹구고 세제로 씻어 주세요.", english: "Please rinse the plates first, then wash them with detergent.", category: "설거지", difficulty: "elementary" },
  { id: "rs003", korean: "수저는 따로 모아서 세척해 주세요.", english: "Please gather the utensils separately and wash them.", category: "설거지", difficulty: "elementary" },
  { id: "rs004", korean: "뜨거우니까 조심하세요.", english: "It's hot, so please be careful.", category: "안전", difficulty: "elementary" },
  { id: "rs005", korean: "바닥이 미끄러우니 조심히 걸어 주세요.", english: "The floor is slippery, so please walk carefully.", category: "안전", difficulty: "elementary" },
  { id: "rs006", korean: "주문 들어왔어요. 테이블 5번이에요.", english: "An order came in. It's for table number 5.", category: "주문", difficulty: "elementary" },
  { id: "rs007", korean: "물 좀 더 가져다 드릴까요?", english: "Would you like me to bring you some more water?", category: "서빙", difficulty: "elementary" },
  { id: "rs008", korean: "반찬 리필해 드릴까요?", english: "Would you like me to refill your side dishes?", category: "서빙", difficulty: "elementary" },
  { id: "rs009", korean: "잠시만 기다려 주세요. 곧 준비해 드릴게요.", english: "Please wait a moment. I will prepare it for you shortly.", category: "서빙", difficulty: "elementary" },
  { id: "rs010", korean: "포장해 드릴까요, 아니면 여기서 드실 건가요?", english: "Would you like it to go, or will you be eating here?", category: "주문", difficulty: "elementary" },
  { id: "rs011", korean: "계산은 카드로 하실까요, 현금으로 하실까요?", english: "Would you like to pay by card or cash?", category: "계산", difficulty: "elementary" },
  { id: "rs012", korean: "유통기한을 확인해 주세요.", english: "Please check the expiration date.", category: "안전", difficulty: "elementary" },
  { id: "rs013", korean: "쓰레기를 분리수거해 주세요.", english: "Please sort the trash.", category: "청소", difficulty: "elementary" },
  { id: "rs014", korean: "테이블을 깨끗이 닦고 세팅해 주세요.", english: "Please wipe the table clean and set it.", category: "청소", difficulty: "elementary" },
  { id: "rs015", korean: "주문하신 음식 나왔습니다.", english: "Here is the food you ordered.", category: "서빙", difficulty: "elementary" },
  { id: "rs016", korean: "잠시만요. 확인하고 오겠습니다.", english: "Just a moment. I will check and come back.", category: "서빙", difficulty: "elementary" },
  { id: "rs017", korean: "오늘도 수고하셨어요.", english: "Good job today as well.", category: "인사", difficulty: "elementary" },
  { id: "rs018", korean: "마감 청소 시작합시다.", english: "Let's start the closing cleanup.", category: "청소", difficulty: "elementary" },
  { id: "rs019", korean: "가게 문 닫을 시간이에요.", english: "It's time to close the shop.", category: "운영", difficulty: "elementary" },
  { id: "rs020", korean: "의자를 주방에 넣어 주세요.", english: "Please put the chairs into the kitchen.", category: "청소", difficulty: "elementary" },
  // More sentences would continue here...
  { id: "rs021", korean: "컵을 확인해 주세요.", english: "Please check the cups.", category: "확인", difficulty: "elementary" },
  { id: "rs022", korean: "물을 깨끗이 닦아 주세요.", english: "Please wipe the water clean.", category: "청소", difficulty: "elementary" },
  { id: "rs023", korean: "수저를 확인해 주세요.", english: "Please check the utensils.", category: "확인", difficulty: "elementary" },
  { id: "rs024", korean: "의자를 세척실로 옮겨 주세요.", english: "Please move the chairs to the dishwashing area.", category: "이동", difficulty: "elementary" },
  { id: "rs025", korean: "세제를 깨끗이 닦아 주세요.", english: "Please wipe the detergent clean.", category: "청소", difficulty: "elementary" },
  { id: "rs026", korean: "반찬을 깨끗이 닦아 주세요.", english: "Please wipe the side dishes clean.", category: "청소", difficulty: "elementary" },
  { id: "rs027", korean: "홀을 빨리 정리해 주세요.", english: "Please organize the dining hall quickly.", category: "정리", difficulty: "elementary" },
  { id: "rs028", korean: "컵을 창고에 넣어 주세요.", english: "Please put the cups into the storage room.", category: "이동", difficulty: "elementary" },
  { id: "rs029", korean: "포장용기를 빨리 정리해 주세요.", english: "Please organize the takeout containers quickly.", category: "정리", difficulty: "elementary" },
  { id: "rs030", korean: "소스를 빨리 정리해 주세요.", english: "Please organize the sauces quickly.", category: "정리", difficulty: "elementary" },
  { id: "rs031", korean: "바닥을 깨끗이 닦아 주세요.", english: "Please wipe the floor clean.", category: "청소", difficulty: "elementary" },
  { id: "rs032", korean: "세제를 빨리 정리해 주세요.", english: "Please organize the detergent quickly.", category: "정리", difficulty: "elementary" },
  { id: "rs033", korean: "냉동실을 확인해 주세요.", english: "Please check the freezer.", category: "확인", difficulty: "elementary" },
  { id: "rs034", korean: "음식물쓰레기를 확인해 주세요.", english: "Please check the food waste.", category: "확인", difficulty: "elementary" },
  { id: "rs035", korean: "주방을 확인해 주세요.", english: "Please check the kitchen.", category: "확인", difficulty: "elementary" },
  { id: "rs036", korean: "행주를 냉장고에 넣어 주세요.", english: "Please put the dishcloth into the refrigerator.", category: "이동", difficulty: "elementary" },
  { id: "rs037", korean: "냅킨을 세척실로 옮겨 주세요.", english: "Please move the napkins to the dishwashing area.", category: "이동", difficulty: "elementary" },
  { id: "rs038", korean: "접시를 세척실로 옮겨 주세요.", english: "Please move the plates to the dishwashing area.", category: "이동", difficulty: "elementary" },
  { id: "rs039", korean: "수저를 주방으로 옮겨 주세요.", english: "Please move the utensils to the kitchen.", category: "이동", difficulty: "elementary" },
  { id: "rs040", korean: "수세미를 확인해 주세요.", english: "Please check the scrubbing sponge.", category: "확인", difficulty: "elementary" },
  { id: "rs041", korean: "의자를 홀로 옮겨 주세요.", english: "Please move the chairs to the dining hall.", category: "이동", difficulty: "elementary" },
  { id: "rs042", korean: "재료를 확인해 주세요.", english: "Please check the ingredients.", category: "확인", difficulty: "elementary" },
  { id: "rs043", korean: "쟁반을 빨리 정리해 주세요.", english: "Please organize the trays quickly.", category: "정리", difficulty: "elementary" },
  { id: "rs044", korean: "컵을 깨끗이 닦아 주세요.", english: "Please wipe the cups clean.", category: "청소", difficulty: "elementary" },
  { id: "rs045", korean: "물을 홀에 넣어 주세요.", english: "Please bring the water to the dining hall.", category: "이동", difficulty: "elementary" },
  { id: "rs046", korean: "홀을 창고로 옮겨 주세요.", english: "Please move the hall items to the storage room.", category: "이동", difficulty: "elementary" },
  { id: "rs047", korean: "재료를 확인해 주세요.", english: "Please check the ingredients.", category: "확인", difficulty: "elementary" },
  { id: "rs048", korean: "의자를 깨끗이 닦아 주세요.", english: "Please wipe the chairs clean.", category: "청소", difficulty: "elementary" },
  { id: "rs049", korean: "음식물쓰레기를 빨리 정리해 주세요.", english: "Please organize the food waste quickly.", category: "정리", difficulty: "elementary" },
  { id: "rs050", korean: "냅킨을 빨리 정리해 주세요.", english: "Please organize the napkins quickly.", category: "정리", difficulty: "elementary" }
];

// Helper function to get sentences by category
export function getSentencesByCategory(category: string): RestaurantSentence[] {
  return RESTAURANT_SENTENCES.filter(sentence => sentence.category === category);
}

// Get all sentence categories
export function getSentenceCategories(): string[] {
  return [...new Set(RESTAURANT_SENTENCES.map(s => s.category))];
}

export default RESTAURANT_SENTENCES;