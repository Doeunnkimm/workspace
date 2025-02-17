# 5장 any 다루기

- 전통적으로 프로그래밍 언어들의 타입 시스템은 완전히 정적이거나 완전히 동적으로 확실히 구분되어 있다.
- 그러나 타입스크립트의 타입 시스템은 선택적(optional)이고 점진적(gradual)이기 때문에 정적이면서도 동적인 특성을 가진다.
- 따라서 타입스크립트는 프로그램의 일부분에만 타입 시스템을 적용할 수 있다.
- 프로그램의 일부분에만 타입 시스템을 적용할 수 있다는 특성 덕분에 점진적인 마이그레이션(자바스크립트 코드를 타입스크립트로 전환)이 가능하다.
- 마이그레이션을 할 때 코드의 일부분에 타입 체크를 비활성화시켜 주는 any 타입이 중요한 역할을 한다.
- 또한 any를 현명하게 사용하는 방법을 익혀야만 효과적인 타입스크립트 코드를 작성할 수 있다.
- **any가 매우 강력한 힘을 가지므로 남용하게 될 소지가 높기 때문이다.**
- 5장에서는 any의 장점은 살리면서 단점을 줄이는 방법들을 살펴보겠다.

---

## 🌱 아이템38. any 타입은 가능한 한 좁은 범위에서만 사용하기

- 먼저, 함수와 관련된 any의 사용법을 살펴보자.

  ```
  function processBar(b: Bar) { ... }

  function f() {
      const x = expressionReturningFoo();
      processBar(x);
              // ~ 'Foo' 형식의 인수는 'Bar' 형식의 매개변수에 할당될 수 없습니다.
  }
  ```

  문맥상으로 x라는 변수가 동시에 Foo 타입과 Var 타입에 할당 가능하다면, 오류를 제거하는 방법은 두 가지이다.

  ```
  function f1() {
    const x: any = expressionReturningFoo();    // 이렇게 하지 맙시다.
    processBar(x);
  }

  function f2() {
    const x = expressionReturningFoo();
    processBar(x as any);                       // 이게 낫습니다.
  }
  ```

  두 가지 해결책 중에서 f1에 사용된 x: any보다 f2에 사용된 x as any 형태가 권장된다. 그 이유는 **any 타입이 processBar 함수의 매개변수에서만 사용된 표현식이므로** 다른 코드에는 영향을 미치지 않기 때문이다. f1에서는 함수의 마지막까지 x 타입이 any인 반면, f2에서는 processBar 호출 이후에 x가 그대로 Foo 타입이다.

  <br>

  <strong>⭐ any 타입이 processBar 함수의 매개변수에서만 사용된 표현식이므로 ⭐</strong>

  <br>

  만일 f1 함수가 x를 반환한다면 문제가 커진다. 예를 들어보자.

  ```
  function f1() {
    const x: any = expressionReturningFoo();
    processBar(x);
    return x;
  }

  function g() {
    const foo = f1(); // 타입이 any
    foo.fooMethod(); // 이 함수 호출은 체크되지 않는다.
  }
  ```

  g 함수 내에서 f1이 사용되므로 f1의 반환 타입인 any 타입이 foo의 타입에 영향을 미친다. 이렇게 **함수에서 any를 반환하면 그 영향력은 프로젝트 전반에 전염병처럼 퍼지게** 된다.

  <br>

  **⭐ 반면 any의 사용 범위를 좁게 제한하는 f2 함수를 사용한다면 any 타입이 함수 바깥으로 영향을 미치지 않는다. ⭐**

  <br>

- 비슷한 관점에서, 타입스크립트가 함수의 반환 타입을 추론할 수 있는 경우에도 함수의 반환 타입을 명시하는 것이 좋다.
- 함수의 반환 타입을 명시하면 any 타입이 함수 바깥으로 영향을 미치는 것을 방지할 수 있다.

<br>

- 다시 f1과 f2 함수를 다시 한번 살펴보자.
- f1은 오류를 제거하기 위해 x를 any 타입으로 선언했다.
- 한편 f2는 오류를 제거하기 위해 x가 사용되는 곳에 as any 타입 단언문을 사용했다.
- 여기서 @ts-ignore를 사용하면 any를 사용하지 않고 오류를 제거할 수 있다.

  ```
  function f1() {
      const x = expressionReturningFoo();
      // @ts-ignore
      processBar(x);
      return x;
  }
  ```

  @ts-ignore를 사용한 다음 줄의 오류가 무시된다. 그러나 근본적인 원인을 해결한 것이 아니기 때문에 다른 곳에서 더 큰 문제가 발생할 수도 있다.

  <br>

  **타입 체커가 알려 주는 오류는 문제가 될 가능성이 높은 부분**이므로 **근본적인 원인을 찾아 적극적으로 대처**하는 것이 바람직하다.

    <br>

- 이번에는 객체와 관련된 any의 사용법을 살펴보겠다.
- 어떤 큰 객체 안의 한 개 속성이 타입 오류를 가지는 상황을 예로 들어보겠다.
  ```
  const config: Config = {
      a: 1,
      b: 2,
      c: {
          key: value
      //  ~~~ 'foo' 속성이 'Foo' 타입에 필요하지만 'Bar' 타입에는 없습니다.
      }
  }
  ```
  단순히 생각하면 config 객체 전체를 as any로 선언해서 오류를 제거할 수 있다.
  ```
  const config: Config = {
    a: 1,
    b: 2,
    c: {
        key: value
    }
  } as any; // 이렇게 하지 맙시다!
  ```
  객체 전체를 any로 단언하면 **다른 속성들(a와 b) 역시 타입 체크가 되지 않는 부작용이 생긴다.** 그러므로 다음 코드처럼 최소한의 범위에만 any를 사용하는 것이 좋다.
  ```
  const config: Config = {
    a: 1,
    b: 2, // 이 속성은 여전히 체크됩니다.
    c: {
        key: value as any
    }
  }
  ```

---

## 🌱 아이템39. any를 구체적으로 변형해서 사용하기

- any는 자바스크립트에서 표현할 수 있는 모든 값을 아우르는 매우 큰 범위의 타입이다.
- any 타입에는 모든 숫자, 문자열, 배열, 객체, 정규식, 함수, 클래스, DOM 엘리먼트는 물론 null과 undefined까지도 포함된다.
- 반대로 말하면, **일반적인 상황에서는 any보다 더 구체적으로 표현할 수 있는 타입이 존재**할 가능성이 높기 때문에 **더 구체적인 타입을 찾아 타입 안전성을 높이도록** 해야 한다.
- 예를 들어, any 타입의 값을 그대로 정규식이나 함수에 넣는 것은 권장되지 않는다.

  ```
  function getLengthBad(array: any) { // 이렇게 하지 맙시다!
      return array.length
  }

  function getLength(array: any[]) {
    return array.length
  }
  ```

  위 코드에서 any를 사용하는 getLengthBad보다는 any[]를 사용하는 getLength가 더 좋은 함수이다. 그 이유는 세 가지이다.

  ```
  1. 함수 내의 array.length 타입이 체크된다.
  2. 함수의 반환 타입이 any 대신 number로 추론된다.
  3. 함수 호출될 때 매개변수가 배열인지 체크된다.
  ```

  배열이 아닌 값을 넣어서 실행해 보면, getLength는 제대로 오류를 표시하지만 getLengthBad는 오류를 잡아내지 못하는 것을 볼 수 있다.

  <br>

  함수의 매개변수를 구체화할 때, (요소의 타입에 관계없이) 배열의 배열 형태라면 any[][]처럼 선언하면 된다. 그리고 **함수의 매개변수가 객체이긴 하지만 값을 알 수 없다면 `{[key: string]: any}`처럼 선언하면 된다.**

  ```
  function hasTwelveLetterKey(o: {[key: string]: any}) {
    for (const key in o) {
        if (key.length === 12) {
            return true;
        }
    }
    return false;
  }
  ```

  객체지만 속성에 접근할 수 없어야 한다면 unknown 타입이 필요한 상황일 수 있다.

- 함수의 타입에도 단순히 any를 사용해서는 안된다.
- 최소한으로나마 구체화할 수 있는 세 가지 방법이 있다.

```
type Fn0 = () => any;                   // 매개변수 없이 호출 가능한 모든 함수
type Fn1 = (arg: any) => any            // 매개변수 1개
type FnN = (...args: any[]) => any;     // 모든 개수의 매개변수 "Function" 타입과 동일하다.
```

위 코드에 등장한 세 가지 함수 타입 모두 any보다는 구체적이다.
마지막 줄을 잘 살펴보면 ...args의 타입을 any[]로 선언했다. any로 선언해도 동작하지만 any[]로 선언하면 배열 형태라는 것을 알 수 있어 더 구체적이다.

```
const numArgsBad = (...args: any) => args.length; // any를 반환
const numArgsGood = (...args: any[]) => args.length // number를 반환
```

이 예제가 any[] 타입을 사용하는 가장 일반적인 경우이다.

---

## 🌱 아이템40. 함수 안으로 타입 단언문 감추기

- 함수를 작성하다 보면, 외부로 드러난 타입 정의는 간단하지만, 내부 로직이 복잡해서 안전한 타입으로 구현하기 어려운 경우가 많다.
- 함수의 모든 부분을 안전한 타입으로 구현하는 것이 이상적이지만, **불필요한 예외 상황까지 고려해 가며 타입 정보를 힘들게 구성할 필요는 없다.**
- **함수 내부에는 타입 단언을 사용하고 함수 외부로 드러나는 타입 정의를 정확히 명시하는 정도로 끝내는 게 낫다.**
- `프로젝트 전반에 위험한 타입 단언문이 드러나 있는 것보다, 제대로 타입이 정의된 함수 안으로 타입 단언문을 감추는 것이 더 좋은 설계이다.`

<br>

- 예를 들어, 어떤 함수가 자신의 마지막 호출을 캐시하도록 만든다고 가정해 보자.
- 함수 캐싱은 리액트 같은 프레임워크에서 실행 시간이 오래 걸리는 함수 호출을 개선하는 일반적인 기법이다.
- 어떤 함수든 캐싱할 수 있도록 래퍼 함수 `cacheLast`를 만들어 보자.

  ```
  declare function cacheLast<T extends Function>(fn: T): T;
  ```

  구현체는 다음과 같다.

  ```
  declare function shallowEqual(a: any, b: any): boolean;
  function cacheLast<T extends Function>(fn: T): T {
    let lastArgs: any[] | null = null;
    let lastResult: any;
    return function(...args: any[]) {
    //     ~~~~~~~~~~~~~~~~~~~~~~~~~
    //     '(...args: any[]) => any' 형식은 'T' 형식에 할당할 수 없습니다.
        if (!lastArgs || !shallowEqual(lastArgs, args)) {
            lastResult = fn(...args);
            lastArgs = args;
        }
        return lastResult;
    }
  }
  ```

  타입스크립트는 반환문에 있어 함수와 원본 함수 T 타입이 어떤 관련이 있는지 알지 못하기 때문에 오류가 발생했다.

  <br>

  그러나 결과적으로 원본 함수 T 타입과 동일한 매개변수로 호출되고 반환값 역시 예상한 결과가 되기 때문에, 타입 단언문을 추가해서 오류를 제거하는 것이 큰 문제가 되지는 않는다.

  ```
  function cacheLast<T extends Function>(fn: T): T {
    let lastArgs: any[] | null = null;
    let lastResult: any;
    return function(...args: any[]) {
        if (!lastArgs || !shallowEqual(lastArgs, args)) {
            lastResult = fn(...args);
        }
        return lastResult;
    } as unknown as T;
  }
  ```

  실제로 함수를 실행해 보면 잘 동작한다. 함수 내부에는 any가 꽤 많아 보이지만 타입 정의에는 any가 없기 때문에, cacheLast를 호출하는 쪽에서는 any가 사용됐는지 알지 못한다.

  <br>

  한편, 앞 코드에 나온 shallowEqual은 두 개의 배열을 매개변수로 받아서 비교하는 함수이며 타입 정의와 구현이 간단하다.

  <br>

  그러나 객체를 매개변수로 하는 shallowObjectEqual은 타입 정의는 간단하지만 구현이 조금 복잡하다.
  먼저 shallowObjectEqual의 타입 정의를 보겠다.

  ```
  declare function shallowObjectEqual<T extends object>(a: T, b: T): boolean;
  ```

  객체 매개변수 a와 b가 동일한 키를 가진다는 보장이 없기 때문에 구현할 때는 주의해야 한다.

  ```
  declare function shallowEqual(a: any, b: any): boolean;
  function shallowObjectEqual<T extends object>(a: T, b: T): boolean {
    for (const [k, aVal] of Object.entries(a)) {
        if (!(k in b) || aVal !== b[k]) {
                               // ~~~~ '{}' 형식에 인덱스 시그니처가 없으므로
                               // 요소에 암시적으로 'any' 형식이 있습니다.
            return false;
        }
    }
    return Object.keys(a).length === Object.keys(b).length;
  }

  ```

  if 구문의 k in b 체크로 b 객체에 k 속성이 있다는 것을 확인했지만 b[k] 부분에서 오류가 발생하는 것이 이상하다(타입스크립트의 문맥 활용 능력이 부족한 것으로 보인다). 어쨌든 실제 오류가 아니라는 것을 알고 있기 때문에 any로 단언하는 수밖에 없다.

  ```
  function shallowObjectEqual<T extends object>(a: T, b: T): boolean {
    for (const [k, aVal] of Object.entries(a)) {
        if (!(k in b) || aVal !== (b as any)[k]) {
            return false;
        }
    }
    return Object.keys(a).length === Object.keys(b).length;
  }
  ```

  b as any 타입 단언문은 안전하며(k in b 체크를 했으므로), 결국 정확한 타입으로 정의되고 제대로 구현된 함수가 된다.

  <br>

  객체가 같은지 체크하기 위해 객체 순회와 단언문이 코드에 들어가는 것보다, 앞의 코드처럼 별도의 함수로 분리해 내는 것이 훨씬 좋은 설계이다.

  <br>

- 정리한 필기
  ![](/assets/images/2022/2023-05-28-20-44-05.png)

---

## 🌱 아이템42. any의 진화를 이해하기

- 타입스크립트에서 일반적으로 변수의 타입은 변수를 선언할 때 결정된다.
- 그 후 정제될 수 있지만(예를 들어 null인지 체크해서), 새로운 값이 추가되도록 확장할 수는 없다.
- 그러나 any 타입과 관련해서 예외인 경우가 존재한다.
- 타입스크립트에서 일정 범위의 숫자들을 생성하는 함수를 예로 들어보겠다.

  ```
  function range(start, limit) {
      const out = [];
      for (let i=start; i<limit; i++) {
          out.push(i);
      }
      return out;
  }
  ```

  이 코드를 타입스크립트로 변환하면 예상한 대로 동작한다.

  ```
  function range(start: number, limit: number) {
    const out = [];
    for (let i=start; i<limit; i++) {
        out.push(i);
    }
    return out; // 반환 타입이 number[]로 추론됨.
  }
  ```

  그러나 자세히 살펴보면 한 가지 이상한 점을 발견할 수 있다.
  out의 타입이 처음에는 any 타입 배열인 []로 초기화되었었는데, 마지막에는 number[]로 추론되고 있다.

  <br>

  코드에 out이 등장하는 세 가지 위치를 조사해 보면 이유를 알 수 있다.

  ```
  function range(start: number, limit: number) {
    const out = []; // 타입이 any[]
    for (let i=start; i<limit; i++) {
        out.push(i); // out의 타입이 any[]
    }
    return out; // 타입이 number[]
  }
  ```

  out의 타입은 any[]로 선언되었지만 number 타입의 값을 넣는 순간부터 타입은 number[]로 진화(evolve)한다.

  <br>

  **타입의 진화는 타입 좁히기와 다르다.** 배열의 다양한 타입의 요소를 넣으면 배열의 타입이 확장되며 진화한다.

  ```
  const result = [];    // 타입이 any[]
  result.push('a');
  result                // 타입이 string[]
  result(1);
  result                // 타입이 (string | number)[]
  ```

  또한 조건문에서는 분기에 따라 타입이 변할 수도 있다. 다음 코드에서는 배열이 아닌 단순 값으로 예를 들어보겠다.

  ```
  let val; // 타입이 any
  if (Math.random() < 0.5) {
    val = /hello/;
    val // 타입이 RegExp
  } else {
    val = 12;
    val // 타입이 number
  }
  val // 타입이 number | RegExp
  ```

  변수의 초기값이 null인 경우도 any의 진화가 일어난다.
  보통은 try/catch 블록 안에서 변수를 할당하는 경우에 나타난다.

  ```
  let val = null; // 타입이 any
  try {
    somethingDangerous();
    val = 12;
    val // 타입이 number
  } catch (e) {
    console.warn('alas!');
  }
  val; // 타입이 number | null
  ```

  any 타입의 진화는 noImplicitAny가 설정된 상태에서 변수의 타입이 임시적인 any인 경우에만 일어난다. 그러나 **다음처럼 명시적으로 any를 선언하면 타입이 그대로 유지된다.**

  ```
  let val: any; // 타입이 any
  if (Math.random() < 0.5) {
    val = /hello/;
    val // 타입이 any
  } else {
    val = 12;
    val // 타입이 any
  }
  val // 타입이 any
  ```

  다음 코드처럼, 암시적 any 상태인 변수에 어떠한 할당도 하지 않고 사용하려고 하면 암시적 any 오류가 발생하게 된다.

  ```
  function range(start: number, limit: number) {
    const out = [];
    //    ~~~ 'out' 변수는 형식을 확인할 수 없는 경우
    //         일부 위치에서 암시적으로 'any[]'형식입니다.
    if (start === limit) {
        return out;
        //     ~~~ 'out' 변수에는 암시적으로 'any[]' 형식이 포함됩니다.
    }
    for (let i = start; i < limit; i++) {
        out.push(i);
    }
    return out;
  }
  ```

  <p align="center"><strong>⭐ any 타입의 진화는 암시적 any 타입에 어떤 값을 할당할 때만 발생한다. ⭐</strong></p>

  <br>

  <p align="center"><strong>⭐ 그리고 어떤 변수가 암시적 any 상태일 때 값을 읽으려고 하면 오류가 발생한다. ⭐</strong></p>

  <br>

  암시적 any 타입은 함수 호출을 거쳐도 진화하지 않는다. 다음 코드에서 forEach 안의 화살표 함수는 추론에 영향을 미치지 않는다.

  ```
  function makeSquares(start: number, limit: number) {
    const out = [];
      // ~~~~~ 'out' 변수는 일부 위치에서 암시적으로 'any[]' 형식입니다.
    range(start, limit).forEach(i => {
        out.push(i * i);
    })
    return out;
        // ~~~~ 'out' 변수에는 암시적으로 'any[]' 형식이 포함됩니다.
  }
  ```

  - 앞의 코드와 같은 경우라면 루프로 순회하는 대신, 배열의 map과 filter 메서드를 통해 단일 구문으로 배열을 생성하여 any 전체를 진화시키는 방법을 생각해 볼 수 있다.

  <br>

- any가 진화하는 방식은 일반적인 변수가 추론되는 원리와 동일하다.
- 예를 들어, 진화한 배열의 타입이 (string | number)[]라면, 원래 number[] 타입이어야 하지만 실수로 string이 섞여서 잘못 진화한 것일 수 있다.
- 타입을 안전하게 지키기 위해서는 암시적 any를 진화시키는 방식보다 명시적 타입 구문을 사용하는 것이 더 좋은 설게이다.

---

## 🌱 아이템42. 모르는 타입의 값에는 any 대신 unknown을 사용하기

- 이번에는 unknown에 대해 알아보자.
- unknown에는 함수의 반환값과 관련된 형태, 변수 선언과 관련된 형태, 단언문과 관련된 형태가 있는데, 이를 순차적으로 알아보자.
- 그리고 unknown과 유사하지만 조금 다른 형태도 살펴보자.

<br>

<strong>함수의 반환값과 관련된 unknown</strong>

- YAML 파서인 parseYAML 함수를 작성한다고 가정해 보자.
- JSON.parse의 반환 타입과 동일하게 parseYAML 메서드의 반환 타입을 any로 만들어보겠다.

  ```javascript
  function parseYAML(yaml: string): any {
    // ...
  }
  ```

  아이템38에서 설명했듯이 함수의 반환 타입으로 any를 사용하는 것은 좋지 않은 설계이다.

    <br>

  대신 parseYAML를 호출한 곳에서 반환값을 원하는 타입으로 할당하는 것이 이상적이다.

  ```javascript
  interface Book {
    name: string;
    author: string;
  }
  const book: Book = parseYAML(`
    name: Wuthering Heights
    author: Emily Bronte
  `);
  ```

  그러나 함수의 반환값에 타입 선언을 강제할 수 없기 때문에, 호출한 곳에서 타입 선언을 생략하게 되면 book 함수는 암시적 any 타입이 되고, 사용되는 곳마다 타입 오류가 발생하게 된다.

  ```javascript
  const book = parseYAML(`
    name: Wuthering Heights
    author: Emily Bronte
  `);
  alert(book.title); // 오류 없음, 런타임에 "undefined" 경고
  book('read'); // 오류 없음, 런타임에 "TypeError: book은 함수가 아닙니다" 예외 발생
  ```

  대신 parseYAML이 **unknown 타입을 반환하게 만드는 것이 더 안전**하다.

  ```javascript
  function safeParseYAML(yaml: string): unknown {
    return parseYAML(yaml);
  }
  const book = safeParseYAML(`
    name: The Tenant of Wildfell Hall
    author: Anne Bronte
  `);
  alert(book.title);
  // ~~~~~ 개체가 'unknown' 형식입니다.
  book('read');
  //~~~~~~~~~~ 개체가 'unknown' 형식입니다.
  ```

  unknown 타입을 이해하기 위해서는 할당 가능성의 관점에서 any를 생각해 볼 필요가 있다. **any가 강력하면서도 위험한 이유**는 다음 두 가지 특징으로부터 비롯된다.

  ```
  1. 어떠한 타입이든 any 타입에 할당 가능하다.
  2. any 타입은 어떠한 타입으로도 할당 가능하다.
  ```

  '타입을 값의 집합으로 생각하기'의 관점에서, 한 집합은 다른 모든 집합의 부분 집합이면서 동시에 상위 집합이 될 수 없기 때문에, 분명히 any는 타입 시스템과 상충되는 면을 가지고 있다.

  <br>

  이러한 점이 any의 강력함의 원천이면서 동시에 문제를 일으키는 원인이 된다.

  <br>

  타입 체커는 집합 기반이기 때문에 any를 사용하면 타입 체커가 무용지물이 된다는 것을 주의해야 한다.

  <br>

- unknown은 **any 대신 쓸 수 있는 타입 시스템에 부합**하는 타입이다.
- unknown 타입은 앞에서 언급한 any의 첫 번째 속성(어떠한 타입이든 unknown에 할당 가능)을 만족하지만, 두 번째 속성(unknown은 오직 unknown과 any에만 할당 가능)은 만족하지 않는다.

<p align="center"><strong>⭐ 어떠한 타입이든 unknown에 할당 가능 ⭐</strong></p>
<p align="center"><strong>⭐ unknown은 unknown과 any에만 할당 가능 ⭐</strong></p>

- 한편 unknown 타입인 채로 값을 사용하면 오류가 발생한다.
- unknown인 값에 함수 호출을 하거나 연산을 하려고 해도 마찬가지이다.
- unknown 상태로 사용하려고 하면 오류가 발생하기 때문에, 적절한 타입으로 변환하도록 강제할 수 있다.

  ```javascript
  const book = safeParseYAML(`
    name: Villette
    author: Charlotte Bronte
  `) as Book
  alert(book.title);
          // ~~~~~~ 'Book' 형식에 'title'이 없습니다.
  book('read');
  //~~~~~~~~~~~ 이 식은 호출할 수 없습니다.
  ```

  함수의 반환 타입인 unknown 그대로 값을 사용할 수 없기 때문에 Book으로 타입 단언을 해야 한다. 애초에 반환값이 Book이라고 기대하며 함수를 호출하기 때문에 단언문은 문제가 되지 않는다.

  <br>

  그리고 Book 타입 기준으로 타입 체크가 되기 때문에, unknown 타입 기준으로 오류를 표시했던 예제보다 오류의 정보가 더 정확해진다.

  <br>

<strong>변수 선언과 관련된 unknown</strong>

<p align="center"><strong>⭐ 어떠한 값이 있지만 그 타입을 모르는 경우에 unknown을 사용한다. ⭐</strong></p>

- 예를 들어, GeoJSON 사양에서 Feature의 properties 속성은 JSON 직렬화가 가능한 모든 것을 담는 잡동사니 주머니 같은 존재이다.
- 그래서 타입을 예상할 수 없기 때문에 unknown을 사용한다.

  ```javascript
  interface Feature {
    id?: string | number;
    geometry: Geometry;
    properties: unknown; // 어떤 타입이 들어올지 몰라서
  }
  ```

  타입 단언문이 unknown에서 원하는 타입으로 변환하는 유일한 방법은 아니다. **instanceof를 체크한 후 unknown에서 원하는 타입으로 변환**할 수 있다.

  ```javascript
  function processValue(val: unknown) {
    if (val instanceof Date) {
      val; // 타입이 Date
    }
  }
  ```

  또한 사용자 정의 타입 가드로 unknown에서 원하는 타입으로 변환할 수 있다.

  ```javascript
  function isBook(val: unknown): val is Book {
    return (
      typeof(val) === 'object' && val !== null && 'name' in val && 'author' in val
    );
  }
  function processValue(val: unknown) {
    if (isBook(val)) {
      val; // 타입이 Book
    }
  }
  ```

  unknown 타입의 범위를 좁히기 위해서는 상단히 많은 노력이 필요하다.

  <br>

  in 연산자에서 오류를 피하기 위해 먼저 val이 객체임을 확인하고, typeof null === 'object' 이므로 별도의 val이 null이 아님을 확인해야 한다.

  <br>

  가끔 unknown 대신 제너릭 매개변수가 사용되는 경우도 있다. 제너릭을 사용하기 위해 다음 코드처럼 safeParseYAML 함수를 선언할 수도 있다.

  ```javascript
  function safeParseYAML<T>(yaml: string): T {
    return parseYAML(yaml);
  }
  ```

  그러나 위 코드는 일반적으로 타입스크립트에서 좋지 않은 스타일이다.

  <br>

  제너릭을 사용한 스타일은 타입 단언문과 달라 보이지만 기능적으로는 동일하다. 제너릭보다는 unknown을 반환하고 사용자가 직접 단언문을 사용하거나 원하는 대로 타입을 좁히도록 강제하는 것이 좋다.

  <br>

<strong>단언문과 관련된 unknown</strong>

- 이중 단언문에서 any 대신 unknown을 사용할 수도 있다.

  ```javascript
  declare const foo: Foo;
  let barAny = foo as any as Bar;
  ley barUnk = foo as unknown as Bar;
  ```

  - barAny와 barUnk는 **기능적으로 동일**하지만, 나중에 두 개의 단언문을 분리하는 리팩터링을 한다면 **unknown 형태가 더 안전**하다.

  <br>

<strong>unknown과 유사하지만 조금 다른 타입들</strong>

- unknown과 비슷한 방식으로 `object` 또는 `{}`를 사용하는 코드들이 존재한다.
- `object` 또는 `{}`를 사용하는 방법 역시 unknown만큼 범위가 넓은 타입이지만, **unknown보다는 범위가 약간 좁다.**
  ```
  1. {} 타입은 null과 undefined를 제외한 모든 값을 포함한다.
  2. object 타입은 모든 비기본형(non-primitive) 타입으로 이루어진다. 여기에는 true 또는 12 또는 "foo"가 포함되지 않지만 객체와 배열은 포함된다.
  ```
  - unknown 타입이 도입되기 전에는 `{}`가 더 일반적으로 사용되었지만, 최근에는 `{}`를 사용하는 경우가 꽤 드물다.
  - 정말로 `null`과 `undefined`가 불가능하다고 판단되는 경우만 `unknown` 대신 `{}`를 사용하면 된다.

---

## 🌱 아이템43. 몽키 패치보다는 안전한 타입을 사용하기

- 자바스크립트의 가장 유명한 특징 중 하나는, 객체와 클래스에 임의의 속성을 추가할 수 있을 만큼 유연하다는 것 !
- 객체에 속성을 추가할 수 있는 기능은 종종 웹 페이지에서 window나 document에 값을 할당하여 전역 변수를 만드는 데 사용된다.

  ```javascript
  window.monkey = 'Tamarin';
  document.monkey = 'Howler';
  ```

  또는 DOM 엘리먼트에 데이터를 추가하기 위해서도 사용된다.

  ```javascript
  const el = document.getElementById('colobus');
  el.home = 'tree';
  ```

  객체에 속성을 추가하는 코드 스타일은 특히 제이쿼리(jQuery)를 사용하는 코드에서 흔히 볼 수 있다.

  <br>

  심지어 내장 기능의 프로토타입에도 속성을 추가할 수 있다. 그런데 이상한 결과를 보일 때가 있다.

  ```javascript
  > RegExp.prototype.monkey = 'Capuchin'
  "Capuchin"
  >/123/.monkey
  "Capuchin"
  ```

  - 정규식(/123/)에 monkey라는 속성을 추가한 적이 없는데 "Capuchin"이라는 값이 들어 있다.
  - 사실 객체에 임의의 속성을 추가하는 것은 일반적으로 좋은 설계가 아니다.
  - 예를 들어 window 또는 DOM 노드에 데이터를 추가한다고 가정해 보자.
  - 그러면 그 데이터는 기본적으로 전역 변수가 된다.
  - 전역 변수를 사용하면 은연중에 프로그램 내에서 서로 멀리 떨어진 부분들 간에 **의존성을 만들게 된다.**
  - 그러면 함수를 호출할 때마다 부작용(side effect)을 고려해야만 한다.

  <br>

  타입스크립트까지 더하면 또 다른 문제가 발생한다. 타입 체커는 Document와 HTMLElement의 내장 속성에 대해서는 알고 있지만, 임의로 추가한 속성에 대해서는 알지 못한다.

  ```javascript
  document.monkey = 'Tamarin';
  // ~~~~~ 'Document' 유형에 'monkey' 속성이 없습니다.
  ```

  이 오류를 해결하는 가장 간단한 방법은 any 단언문을 사용하는 것이다.

  ```javascript
  (document as any).monky = 'Tamarin'; // 정상, 오타
  (document as any).monkey = /Tamarin/; // 정상, 잘못된 타입
  ```

  최선의 해결책은 document 또는 DOM으로부터 데이터를 분리하는 것이다.

  <br>

  분리할 수 없는 경우(객체와 데이터가 붙어 있어야만 하는 라이브러리를 사용중이거나 자바스크립트 애플리케이션을 마이그레이션 하는 과정중이라면), 두 가지 차선책이 존재

  - 첫 번째, `interface`의 특수 기능 중 하나인 `보강(argumentation)`을 사용하는 것이다.

    ```javascript
    interface Document {
      /** 몽키 패치의 속(genus) 또는 종(species) */
      monkey: string;
    }

    document.monkey = 'Tamarin'; // 정상
    ```

    보강을 사용한 방법이 any보다 나은 점은 다음과 같다.

    ```
    1. 타입이 더 안전하다. 타입 체커는 오타나 잘못된 타입의 할당을 오류로 표시한다.
    2. 속성에 주석을 붙일 수 있다.
    3. 속성에 자동완성을 사용할 수 있다.
    4. 몽키 패치가 어떤 부분에 적용되었는지 정확한 기록이 남는다.
    ```

    그리고 모듈의 관점에서(타입스크립트 파일이 import / export를 사용하는 경우), 제대로 동작하게 하려면 global 선언을 추가해야 한다.

    ```javascript
    export {}
    declare global {
      interface Document {
        /** 몽키 패치의 속(genus) 또는 종(species) */
        monkey: string;
      }
    }
    document.monkey = 'Tamarin'; // 정상
    ```

    - 보강을 사용할 때 주의해야 할 점은 모듈 영역(scope)과 관련있다.
    - 보강은 전역적으로 적용되기 때문에, 코드의 다른 부분이나 라이브러리로부터 분리할 수 없다.
    - 그리고 애플리케이션이 실행되는 동안 속성을 할당하면 실행 시점에서 보강을 적용할 방법이 없다.
    - 특히 웹 페이지 내의 HTML 엘리먼트를 조작할 때, 어떤 엘리먼트는 속성이 있고 어떤 엘리먼트는 속성이 없는 경우 문제가 된다.
    - 이러한 이유로 속성을 string | undefined로 선언할 수도 있다.
    - 이렇게 선언하면 더 정확할 수 있지만 다루기에는 더 불편해진다.

  <br>

  - 두 번째, 더 구체적인 타입 단언문을 사용하는 것

    ```javascript
    interface MonkeyDocument extends Document {
      /** 몽키 패치의 속(genus) 또는 종(species) */
      monkey: string;
    }
    (document as MonkeyDocument).monkey = 'Macaque';
    ```

    MonkeyDocument는 Document를 확장하기 때문에 타입 단언문은 정상이며 할당문의 타입은 안전하다. 또한 Document 타입을 건드리지 않고 별도로 확장하는 새로운 타입을 도입했기 때문에 모듈 영역 문제도 해결할 수 있다.

      <br>

    따라서 몽키 패치된 속성을 참조하는 경우에만 단언문을 사용하거나 새로운 변수를 도입하면 된다.

      <br>

    그러나 몽키 패치를 남용해서는 안 되며 궁긍적으로 더 잘 설계된 구조로 리팩터링하는 것이 좋다.

---

## 🌱 아이템44. 타입 커버리지를 추적하여 타입 안전성 유지하기

- noImplicitAny를 설정하고 모든 암시적 any 대신 명시적 타입 구문을 추가해도 any 타입과 관련된 문제들로부터 안전하다고 할 수 없다.
- any 타입이 여전히 프로그램 내에 존재할 수 있는 두 가지 경우가 있다.
  1. 명시적 any 타입
     - 아이템 38과 아이템 39의 내용에 따라 any 타입의 범위를 좁히고 구체적으로 만들어도 여전히 any 타입이다.
       특히 `any[]`와 `{ [key: string]: any }` 같은 타입은 인덱스를 생성하면 단순 any가 되고 코드 전반에 영향을 미친다.
  2. 서드파티 타입 선언
     - 이 경우는 `@types` 선언 파일로부터 any 타입이 전파되기 때문에 특별히 조심해야 한다. noImplicitAny를 설정하고 절대 any를 사용하지 않았다 하더라도 여전히 any 타입은 코드 전반에 영향을 미친다.

<br>

- any타입은 타입 안전성과 생산성에 부정적 영향을 미칠 수 있으므로, 프로젝트에서 **any의 개수를 추적하는 것이 좋다.**
- npm의 `type-coverage` 패키지를 활용하여 any를 추적할 수 있는 몇 가지 방법이 있다.

  ```bash
  $ npx type-coverage
  9985 / 10117 98.69%
  ```

  결과를 통해 이 프로젝트의 10,11개 심벌 중 9,985개(98.69%)가 any가 아니거나 any의 별칭이 아닌 타입을 가지고 있음을 알 수 있다.
  실수로 any 타입이 추가된다면, 백분율이 감소하게 된다.

  <br>

  위 결과의 백분율은 점수를 추적함으로써 시간이 지남에 따라 코드의 품질을 높일 수 있다.

  <br>

  타입 커버리지 정보를 수집해 보는 것도 유용할 수 있다. `type-coverage`를 실행할 때 `--detail` 플래그를 붙이면, any 타입이 있는 곳을 모두 출력해 준다.

  ```bash
  $ npx type-coverage --detail
  path/to/code.ts:1:10 getColumnInfo
  path/to/module.ts:7:1 pt2
  ```

  이것을 조사해 보면 미처 발견하지 못한 any의 근원지를 찾을 수도 있다.

<br>

- 코드에 any가 남아 있는 이유는 다양하다.
- 오류를 간단히 해결하기 웨해 종종 명시적으로 any를 선언했을 수도 있다.
- 타입 오류가 발생했지만 해결하는 데 시간을 쏟고 싶지 않았을 수도 있다.
- 또는 아직까지 타입을 제대로 작성하지 못했을 수도 있다.
- 아니면 급하게 작업하느라 any인 채로 놔두었을 수도 있다.

<br>

<strong>✨ any가 등장하는 몇 가지 문제와 그 해결책을 살펴보자</strong>

- 표 형태의 데이터에서 어떤 종류의 열(column) 정보를 만들어 내는 함수를 만든다고 가정해 보자

  ```javascript
  function getColumnInfo(name: string): any {
    return utils.buildColumnInfo(appState.dataSchema.name); // any를 반환합니다.
  }
  ```

  - utils.buildColumnInfo 호출은 any를 반환한다.
  - 그래서 getColumnInfo 함수의 반환에는 주석과 함께 명시적으로 : any 구문을 추가했다.

  <br>

  - 이후에 타입 정보를 추가하기 위해 ColumnInfo 타입을 정의하고 utils.buildColumnInfo가 any 대신 ColumnInfo를 반환하도록 개선해도 getColumnInfo 함수의 반환문에 있는 any 타입이 모든 타입 정보를 날려 버리게 된다.

  * getColumnInfo에 남아 있는 any까지 제거해야 문제가 해결된다.

  <br>

- 서드파티 라이브러리로부터 비롯되는 any 타입은 몇 가지 형태로 등장할 수 있지만 가장 극단적인 예는 전체 모듈에 any 타입을 부여하는 것이다.

  ```javascript
  declare module 'my-module';
  ```

  - 앞의 선언으로 인해 my-module에서 어떤 것이든 오류 없이 임포트할 수 있다.
  - 임포트한 모든 심벌은 any 타입이고, 임포트한 값이 사용되는 곳마다 any 타입을 양산하게 된다.

    ```javascript
    import { someMethod, somSymbol } from 'my-module'; // 정상

    const pt1 = {
      x: 1,
      y: 2,
    }; // 타입이 { x: number, y: number }

    const pt2 = somMethod(pt1, someSymbol); // 정상. pt2의 타입이 any
    ```

    - 일반적인 모듈 사용의 사용법과 동일하기 때문에, 타입 정보가 모두 제거됐다는 것을 간과할 수 있다.
    - 또는 동료가 모드 타입 정보를 날려 버렸지만, 알아채지 못하는 경우일 수도 있다.
    - 그렇기 때문에 가끔 해당 모듈을 점검해야 한다.
    - 어느 순간 모듈에 대한 공식 타입 선언이 릴리스되었지도 모른다.
    - 또는 모듈을 충분히 이해한 후에 직접 타입 선언을 작성해서 커뮤니티에 공개할 수도 있다.

    <br>

  - 서드파티 라이브러리로부터 비롯되는 any의 또 다른 형태는 타입에 버그가 있는 경우이다.
  - 예를 들면 값을 생성할 때는 엄격하게 타입을 적용하는 것을 무시한 채로, 함수가 유니온 타입을 반환하도록 선언하고 실제로는 유니온 타입보다 훨씬 더 특정된 값을 반환하는 경우이다.
  - 선언된 타입과 실제 반환된 타입이 맞지 않는다면 어쩔 수 없이 any 단언문을 사용해야 한다.
  - 그러나 나중에 라이브러리가 업데이트되어 함수의 선언문이 제대로 수정된다면 any를 제거해야 한다.
  - 또는 직접 라이브러리의 선언문을 수정하고 커뮤니티에 공개할 수도 있다.

<br>

- any 타입이 사용되는 코드가 실제로는 더 이상 실행되지 않는 코드일 수 있다.
- 또는 어쩔 수 없이 any를 사용했던 부분이 개선되어 제대로 된 타입으로 바뀌었다면 any가 더 이상 필요 없을 수도 있다.
- 버그가 있는 타입 선언문이 업데이트되어 제대로 타입 정보를 가질 수도 있다.
- 타입 커버리지를 추적하면 이러한 부분들을 쉽게 발견할 수 있기 때문에 코드를 꾸준히 점검할 수 있게 해주자.
