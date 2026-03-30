// Blocked words and phrases for child safety
// These are checked in both input and output

export const BLOCKED_WORDS_EN = [
  // Violence
  'kill', 'murder', 'stab', 'shoot', 'weapon', 'gun', 'knife', 'bomb', 'terrorist',
  'suicide', 'self-harm', 'cutting', 'death threat', 'hurt yourself',
  
  // Adult content
  'sex', 'porn', 'nude', 'naked', 'xxx', 'adult content', 'nsfw',
  'dating', 'boyfriend', 'girlfriend', 'kiss', 'romantic',
  
  // Drugs and substances
  'drug', 'cocaine', 'heroin', 'meth', 'marijuana', 'weed', 'alcohol', 'beer', 
  'wine', 'vodka', 'drunk', 'high', 'smoking', 'cigarette', 'vape',
  
  // Profanity (common ones)
  'fuck', 'shit', 'damn', 'hell', 'ass', 'bitch', 'bastard', 'crap',
  
  // Scary/Horror
  'ghost', 'demon', 'devil', 'satan', 'possessed', 'nightmare', 'haunted',
  'creepy', 'horror', 'scary', 'terrifying', 'blood', 'gore',
  
  // Personal information requests
  'phone number', 'address', 'where do you live', 'what school',
  'home address', 'credit card', 'password', 'social security',
  
  // Gambling
  'gambling', 'casino', 'bet', 'poker', 'lottery', 'slot machine',
  
  // Hate speech indicators
  'hate', 'racist', 'sexist', 'discrimination', 'slur',
]

export const BLOCKED_WORDS_VI = [
  // Bạo lực
  'giết', 'chém', 'đâm', 'bắn', 'súng', 'dao', 'bom', 'khủng bố',
  'tự tử', 'tự hại', 'chết',
  
  // Nội dung người lớn
  'sex', 'khiêu dâm', 'khỏa thân', 'người lớn',
  'hẹn hò', 'bạn trai', 'bạn gái', 'hôn',
  
  // Ma túy
  'ma túy', 'thuốc phiện', 'heroin', 'cần sa', 'bia', 'rượu', 'say',
  'thuốc lá', 'hút', 'nghiện',
  
  // Từ tục
  'đm', 'vcl', 'vl', 'đéo', 'cặc', 'lồn', 'địt',
  
  // Kinh dị
  'ma', 'quỷ', 'ác quỷ', 'satan', 'ám', 'kinh dị', 'máu', 'chết',
  
  // Thông tin cá nhân
  'số điện thoại', 'địa chỉ', 'ở đâu', 'trường nào',
  'thẻ tín dụng', 'mật khẩu',
  
  // Cờ bạc
  'cờ bạc', 'casino', 'đánh bạc', 'xổ số',
]

export const BLOCKED_TOPICS = [
  'violence',
  'weapons',
  'drugs',
  'alcohol',
  'adult content',
  'gambling',
  'horror',
  'death',
  'politics',
  'religion controversies',
  'self-harm',
  'eating disorders',
  'bullying instructions',
  'illegal activities',
]

// Safe redirect phrases when blocked content is detected
export const SAFE_REDIRECTS = {
  en: [
    "Let's talk about something fun instead! What's your favorite animal?",
    "Hmm, how about we practice talking about your hobbies?",
    "That's not something we should talk about. What games do you like to play?",
    "Let's change the topic! Tell me about your favorite food!",
    "I'd rather help you practice English with fun topics! What did you do today?",
  ],
  vi: [
    "Hãy nói về điều gì đó vui hơn nhé! Con thích con vật nào nhất?",
    "Hmm, sao chúng ta không luyện tập nói về sở thích của con?",
    "Đó không phải là điều chúng ta nên nói. Con thích chơi trò chơi gì?",
    "Hãy đổi chủ đề nhé! Kể cho tôi nghe về món ăn yêu thích của con!",
    "Tôi muốn giúp con luyện tiếng Anh với những chủ đề vui! Hôm nay con làm gì?",
  ],
}
