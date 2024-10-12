// 生成隨機姓名
export function generateRandomName() {
  const surnames = ["陳", "林", "黃", "張", "李", "王", "吳", "劉", "蔡", "楊"];
  const givenNames = [
    "建民",
    "怡君",
    "俊傑",
    "淑芬",
    "明哲",
    "雅婷",
    "偉強",
    "惠如",
    "宗翰",
    "佳玲",
  ];

  const randomSurname = surnames[Math.floor(Math.random() * surnames.length)];
  const randomGivenName =
    givenNames[Math.floor(Math.random() * givenNames.length)];

  return randomSurname + randomGivenName;
}
