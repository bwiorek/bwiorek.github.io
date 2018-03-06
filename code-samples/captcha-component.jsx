import React from 'react';

class CaptchaHandler {
    constructor(domId, siteKey, callback) {
        this.domId = domId;
        this.siteKey = siteKey;
        this.callback = (callback && typeof callback === "function") ? callback : (() => { });
        this.render = this.render.bind(this);
    }

    render() {
        if (!window.grecaptcha) {
            setTimeout(this.render, 500);
            return;
        }

        grecaptcha.render(
            this.domId,
            {
                'sitekey': this.siteKey,
                'callback': this.callback
            }
        );
    }
}

export default class CaptchaComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const {domId, siteKey, callback} = this.props;
        const captchaHandler = new CaptchaHandler(domId, siteKey, callback);
        captchaHandler.render();
    }

    renderCaptchaElement(domId) {
        return (
            <div className="captcha" id={domId} />
        );
    }

    render() {
        const domId = this.props.domId;

        return (
            <div>{this.renderCaptchaElement(domId)}</div>
        );
    }
}