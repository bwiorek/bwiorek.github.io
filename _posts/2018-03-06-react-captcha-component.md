---
layout: post
title:  "Implementacja Google reCAPTCHA w aplikacji ReactJS"
date:   2018-03-06 22:00:00 +0100
categories: react reactjs
tags: react reactjs captcha recaptcha google js javascript component
---
**W tym poście chciałbym pokazać w jaki sposób dodać captchę do aplikacji w Reactjs.**

Wyobraź sobie, że chciałbyś stworzyć formularz za pomocą którego użytkownicy zapisywaliby się do newslettera. Tworzysz więc pole e-mail z przyciskiem submit... i czekasz aż zacznie przychodzić Ci tona losowych danych generowanych przez spam-boty. Najprostszym sposobem na rozwiązanie tego problemu jest dodanie ukrytego pola do obecnego formularza, którego wypełnienie spowoduje odrzucenie przesłanych danych. Sposób ten jest trywialny i może nie zadziałać w przypadku bardziej zaawansowanych spam-botów.

Sytuację w większości przypadków ratuje **[captcha][captcha]**(*eng. Completely Automated Public Turing test to tell Computers and Humans Apart*), która stara się odróżnić dane wprowadzone przez człowieka, od tych wytworzonych przez program.

### **Google ReCaptcha**
Jedną z popularniejszym implementacji captchy jest ta stworzona przez giganta wyszukiwarkowego. To z niej będę korzystał podczas pisania tego posta.

Aby rozpocząć pracę z Google Recaptcha, potrzebne będzie konto Google. Na stronie **[reCaptcha][GCaptcha]** znajduje się formularz rejestracyjny captchy. W pole label wprowadzam wybraną przez siebie nazwę. Typ zostawiam jako *reCAPTCHA V2*. W polu *Domains* można umieścić adresy domen które będą mogły korzystać z tej instancji.

**Ważne: Jeśli tworzysz captchę do testów, koniecznie dodaj wpisy `localhost` oraz `127.0.0.1`.** Później będziesz mógł je edytować.

![captcha-register]

Po pomyślnej rejestracji otrzymasz dane, których będziesz potrzebował w przyszłych krokach. Zwróć szczególną uwagę na `site key` i `script` z adresem api.

### **Przygotowanie**
Pierwszym krokiem jest dodanie skryptu captchy na początku taga `body` swojej strony. Skrypt ten dostępny jest po ukończeniu rejestracji captchy z początku posta.

{% highlight html %}
<!-- ... -->
</head>
<body>
    <script src='https://www.google.com/recaptcha/api.js'></script>
    <!-- ... -->
</body>
{% endhighlight %}

### **Komponent Captcha w ReactJS**
Przechodzimy do Reacta. Tworzę plik o nazwie, np. captcha.component.jsx.
Na samym początku importuję `React`. Następnie dodaję komponent dziedziczący po `React.Component` o nazwie *CaptchaComponent*, a w konstruktorze przekazuję  `props` do rodzica.

{% highlight react %}
import React from 'react';

export default class CaptchaComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    ...
}
{% endhighlight %}

W kolejnym kroku napiszę dwie metody: `componentDidMount` oraz `renderCaptchaElement`. Pierwsza z nich będzie potrzebna do wywołania api captchy - już po wyrenderowaniu komponentu. Na razie zostawię ją bez implementacji. Druga metoda zwróci element `html`, w miejscu którego tytułowa walidacja zostanie wstrzyknięta. Będzie ona przyjmowała jako swój argument unikalną wartość `id`, w celu późniejszego odwołania się do wyrenderowanego elementu.

{% highlight react %}
componentDidMount() {
    ...
}

renderCaptchaElement(domId) {
    return (
        <div className="captcha" id={domId} />
    );
}
{% endhighlight %}

Na samym końcu komponentu konieczne jest zaimplementowanie metody `render`, która zwróci wynik wywołania `renderCaptchaElement`. Każda captcha powinna mieć swoje id, dlatego do *CaptchaComponent* musi zostać przesłany jakiś identyfikator, powiedzmy `domId`. Można to wykonać z pomocą `props`. Pobraną wartość przekazuję do metody renderującej captchę pamiętając o odwołaniu się do `this`.

{% highlight react %}
render() {
    const domId = this.props.domId;

    return (
        <div>{this.renderCaptchaElement(domId)}</div>
    );
}
{% endhighlight %}

#### **Klasa CaptchaHandler**
Aby obsłużyć kod captchy dla każdej instancji komponentu, stworzę klasę `CaptchaHandler`, która w konstruktorze przyjmie `domId`(nasze id), `siteKey`(ten z procesu rejestracji captchy) i `callback`(funkcję, która wywoła się po pomyślnej walidacji z api) i przypisze je do wartości klasy.

Podczas przypisywanie funkcji `callback`, warto sprawdzić czy rzeczywiście jest ona funkcją - jeśli nie jest, przypisać pustą funkcję. Stworzę także metodę `render`, którą za chwilę wypełnię kodem wywołującym api.

{% highlight react %}
class CaptchaHandler {
    constructor(domId, siteKey, callback) {
        this.domId = domId;
        this.siteKey = siteKey;
        this.callback = (callback && typeof callback === "function")
            ? callback : (() => { });

        this.render = this.render.bind(this);
    }

    render() {
        ...
    }
}
{% endhighlight %}

W `render` skorzystam z metody captchy znajdującej się w obiekcie `window` - `window.grecaptcha`. Możemy się do niej odwołać właśnie dzięki dodaniu skryptu ze ścieżką do api w `body` naszej strony. Może się jednak zdarzyć, że nasz komponent załaduje się szybciej niż skrypt z api. Wynikiem tego byłby błąd stanowiący o braku metody `grecaptcha` w obiekcie `window`.

Najprostszym rozwiązaniem tego problemu jest dodanie kodu na początku `render` sprawdzającego, czy metoda ta jest już dostępna - jeśli nie - z pomocą `setTimeout` - `render` zostanie wywołany ponownie za określoną ilość milisekund aż do momentu wczytania skryptu.

{% highlight react %}
render() {
    if (!window.grecaptcha) {
        setTimeout(this.render, 500);
        return;
    }
    ...
}
{% endhighlight %}

Dzięki temu zabiegowi, jesteśmy pewni, że dalszy kod `render` będzie miał dostęp do api. `grecaptcha` posiada własną metodę `render`, do której przekazuję `elemId`, `siteKey` i `callback` tym samym kończąc tworzenie klasy `CaptchaHandler`. `grecaptcha` skomunikuje się z api i jeśli przesłane dane będą się zgadzały, wyświetli captchę w miejscu naszego elementu html.

{% highlight react %}
grecaptcha.render(
    this.domId,
    {
        'sitekey': this.siteKey,
        'callback': this.callback
    }
);
{% endhighlight %}

Po wykonaniu powyższych czynności powinniśmy móc pomyślnie wywołać *CaptchaComponent* z innego komponentu.

{% highlight react %}
import CaptchaComponent from '<ścieżka-do-komponentu>';
...
const invokeWhenCaptchaResponseWithSuccess = () => {
    alert("Sukces! Nie jesteś robotem!");
};
...
return (
    <div>
        ...
        <CaptchaComponent
            domId="google-captcha"
            siteKey="6LdncEoUAAAAAMfQGXFs5zW10FG1FG2paicPf4n9"
            callback={invokeWhenCaptchaResponseWithSuccess}
        />
        ...
    </div>
);
{% endhighlight %}

Jak zapewne zauważysz, nic się nie wyświetli, ponieważ nie dodałem jeszcze żadnego kodu do `componentDidMount`. Zrobię to teraz.

{% highlight react %}
...
componentDidMount() {
    const {domId, siteKey, callback} = this.props;
    const captchaHandler = new CaptchaHandler(domId, siteKey, callback);
    captchaHandler.render();
}
...
{% endhighlight %}

W powyższym kodzie pobieram wartości `domId`, `siteKey` i `callback` przekazanych poprzez `props`. Następnie tworzę nową instancję `CaptchaHandler` i przekazuję mu pobrane z `props` wartości. Ostatnią czynnością jest wywołanie metody `render` handlera.

W ten sposób napisaliśmy w pełni funkcjonalny komponent korzystający z Google Recaptcha. Rozwiązanie to jest o tyle dobre, ponieważ zawsze możemy podmienić kod funkcji `render` `CaptchaHandler` i tym samym wykorzystać inną implementację Captchy.

Mam nadzieję, że powyższy post będzie przydatny, do zobaczenia w następnym tekście :-).

[**Zobacz cały kod**]({{ base.url }}/code-samples/captcha-component.jsx){:target="_blank"}

[captcha]:https://pl.wikipedia.org/wiki/CAPTCHA
[GCaptcha]:https://www.google.com/recaptcha/admin#list
[captcha-register]:https://i.imgur.com/Ppue8f4.jpg