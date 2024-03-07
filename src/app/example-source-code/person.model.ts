export class Person {
  name: string;
  age: number;
}

export const PersonList: Person[] = [
  { name: 'Ignacio Rossi', age: 25 },
  { name: 'Benoit Lavenier', age: 40 },
  { name: 'Ludovic Pecquot', age: 42 },
  { name: 'Maxime Demarest', age: 36 },
];

export function generatePersons(length?: number, suffix?: string): Person[] {
  length = length || PersonList.length;

  return Array.from({ length }).map((_, i) => {
    const sourceIndex = i % PersonList.length;
    const p = Object.assign(new Person(), PersonList[sourceIndex]);
    p.name += suffix || '';
    return p;
  });
}
