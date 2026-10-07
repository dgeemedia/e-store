export const LEGAL: Record<string, { title: string; sections: [string, string][] }> = {
  terms: { title: 'Terms & Conditions', sections: [
    ['About us', 'Elorge Store is operated by Elorge Technologies Limited (RC 9521453), Nigeria. By placing an order you agree to these terms.'],
    ['Products and prices', 'Prices are in Nigerian naira. Volume discounts apply automatically when your quantity qualifies. We may correct pricing errors and will tell you before shipping if an order is affected. Promotions, flash sales and lightning deals run for the stated time and while stock lasts.'],
    ['Orders and payment', 'An order is confirmed only after payment is received, and we release goods for delivery or pickup only after payment is confirmed. Payments are processed by Flutterwave; we never see or store your card details. Lightning-deal items are held for the time shown and released if you do not pay in time.'],
    ['Delivery', 'We deliver to the address you give us. Delivery fees and times are shown at checkout or on the product page and are estimates. Large or truckload orders are quoted separately.'],
    ['Warranty and returns', 'See our Returns & Warranty policy.'],
    ['Liability', 'To the extent permitted by Nigerian law, our liability is limited to the price paid for the product concerned. Nothing here limits rights you have under law.'],
    ['Governing law', 'These terms are governed by the laws of the Federal Republic of Nigeria.'],
  ] },
  privacy: { title: 'Privacy Policy', sections: [
    ['What we collect', 'Name, phone, email, delivery address and order details when you buy, request a quote, apply to sell or apply to deliver; messages you send through our live chat; account details and saved addresses if you create an account; and, with your consent, anonymous site usage data.'],
    ['Why we use it', 'To process and deliver orders, send receipts and shipping updates, provide support, prevent fraud and meet legal obligations.'],
    ['Who we share it with', 'Service providers that help us run the store: Flutterwave (payments), Resend (email), Sanity (our database), Vercel (hosting), Telegram (live chat), Meta WhatsApp (order updates you opt into), Brevo (email) and delivery partners. We do not sell your data.'],
    ['Cookies and analytics', 'Analytics cookies load only after you accept. You can decline and still use the whole site.'],
    ['Your rights', 'Under the Nigeria Data Protection Act 2023 you may ask to access, correct or delete your data, or object to its use. You can delete your saved account data yourself from the My account page, or contact us using the details in the footer.'],
    ['Retention', 'We keep order records as long as needed for accounting, warranty and legal reasons.'],
  ] },
  returns: { title: 'Returns & Warranty', sections: [
    ['Warranty', 'Products listed with a warranty are covered against manufacturing defects for the period shown on the product page. Keep your invoice: it is your proof of purchase.'],
    ['What is not covered', 'Damage from misuse, wrong installation, accidents, unauthorised repair or normal wear.'],
    ['Faulty or wrong items', 'Contact us within 48 hours of delivery with your order reference and photos. We will repair, replace or refund the item.'],
    ['Change of mind', 'Unused items in original packaging may be returned within 7 days of delivery, at the buyer\'s cost, except perishable goods, hygiene items such as diapers and wipes once opened, and clearance or lightning-deal items.'],
    ['Refunds', 'Approved refunds go back to the original payment method and can take several business days to reach you.'],
    ['Perishable produce', 'Report any problem with fresh produce on the day of delivery, with photos.'],
  ] },
}

type Legal = Record<string, { title: string; sections: [string, string][] }>
/** Translations for convenience. The English text governs if there is any difference. Have a lawyer and a native speaker review before relying on them. */
export const LEGAL_I18N: Record<'zh' | 'fr', Legal> = {
  zh: {
    terms: { title: '条款与条件', sections: [
      ['关于我们', 'Elorge Store 由尼日利亚的 Elorge Technologies Limited（RC 9521453）运营。下单即表示您同意本条款。'],
      ['商品与价格', '价格以尼日利亚奈拉计价。当您的购买数量达到条件时，阶梯折扣会自动适用。我们可能会更正价格错误，如订单受影响，会在发货前告知您。促销、限时特价和闪电特惠仅在所述时间内且库存有限时有效。'],
      ['订单与付款', '只有在收到付款后订单才算确认，并且只有在付款确认后我们才会放行货物进行配送或自提。付款由 Flutterwave 处理，我们不会看到或保存您的银行卡信息。闪电特惠商品会在显示的时间内为您保留，若您未及时付款则会释放。'],
      ['配送', '我们按您提供的地址送货。运费和配送时间会在结算页面或商品页面显示，仅为预估。大额订单或整车订单另行报价。'],
      ['保修与退货', '请参阅我们的《退货与保修》政策。'],
      ['责任', '在尼日利亚法律允许的范围内，我们的责任以您就相关商品所支付的价款为限。本条款不限制您依法享有的权利。'],
      ['适用法律', '本条款受尼日利亚联邦共和国法律管辖。'],
    ] },
    privacy: { title: '隐私政策', sections: [
      ['我们收集的信息', '您购买、申请报价、申请开店或申请成为配送伙伴时提供的姓名、电话、邮箱、送货地址和订单信息；您通过在线客服发送的消息；如您创建账户，则包括账户信息和已保存的地址；以及在您同意的情况下收集的匿名网站使用数据。'],
      ['我们如何使用', '用于处理和配送订单、发送收据和发货通知、提供客户支持、防范欺诈并履行法律义务。'],
      ['我们与谁共享', '协助我们运营商店的服务商：Flutterwave（支付）、Resend（邮件）、Sanity（我们的数据库）、Vercel（网站托管）、Telegram（在线客服）、Meta WhatsApp（您选择接收的订单通知）、Brevo（邮件）以及配送合作伙伴。我们不会出售您的数据。'],
      ['Cookie 与统计分析', '只有在您接受后才会加载统计分析 Cookie。您可以拒绝，同样可以使用整个网站。'],
      ['您的权利', '根据《2023 年尼日利亚数据保护法》，您可以要求查阅、更正或删除您的数据，或反对对其使用。您可以在“我的账户”页面自行删除已保存的账户数据，也可以通过页脚中的联系方式联系我们。'],
      ['数据保留', '出于会计、保修和法律原因，我们会在必要期限内保留订单记录。'],
    ] },
    returns: { title: '退货与保修', sections: [
      ['保修', '标明有保修的商品，在商品页面显示的期限内，对制造缺陷提供保修。请保留您的发票，它是您的购买凭证。'],
      ['不在保修范围内的情形', '因误用、安装不当、意外事故、未经授权的维修或正常磨损造成的损坏。'],
      ['商品有故障或发错货', '请在收货后 48 小时内联系我们，并提供订单编号和照片。我们会维修、更换或退款。'],
      ['改变主意', '未使用且保持原包装的商品可在收货后 7 天内退回，运费由买家承担；易腐商品、已拆封的卫生用品（如纸尿裤和湿巾）以及清仓或闪电特惠商品除外。'],
      ['退款', '获批准的退款将退回原支付方式，到账可能需要数个工作日。'],
      ['易腐农产品', '如生鲜农产品有任何问题，请在收货当天附上照片向我们反馈。'],
    ] },
  },
  fr: {
    terms: { title: 'Conditions générales', sections: [
      ['À propos de nous', "Elorge Store est exploité par Elorge Technologies Limited (RC 9521453), Nigeria. En passant une commande, vous acceptez ces conditions."],
      ['Produits et prix', "Les prix sont en nairas nigérians. Les remises sur volume s'appliquent automatiquement lorsque votre quantité y donne droit. Nous pouvons corriger des erreurs de prix et vous préviendrons avant l'expédition si une commande est concernée. Les promotions, ventes flash et ventes éclair durent pendant la période indiquée et dans la limite des stocks disponibles."],
      ['Commandes et paiement', "Une commande n'est confirmée qu'après réception du paiement, et nous ne remettons les marchandises pour livraison ou retrait qu'après confirmation du paiement. Les paiements sont traités par Flutterwave ; nous ne voyons ni ne conservons jamais vos données de carte. Les articles des ventes éclair sont réservés pendant la durée affichée et libérés si vous ne payez pas à temps."],
      ['Livraison', "Nous livrons à l'adresse que vous nous indiquez. Les frais et délais de livraison sont affichés au paiement ou sur la page du produit et sont donnés à titre indicatif. Les grosses commandes ou chargements complets sont chiffrés séparément."],
      ['Garantie et retours', 'Veuillez consulter notre politique de retours et de garantie.'],
      ['Responsabilité', "Dans la mesure permise par la loi nigériane, notre responsabilité est limitée au prix payé pour le produit concerné. Rien ici ne limite les droits que vous confère la loi."],
      ['Droit applicable', 'Les présentes conditions sont régies par les lois de la République fédérale du Nigeria.'],
    ] },
    privacy: { title: 'Politique de confidentialité', sections: [
      ['Ce que nous collectons', "Nom, téléphone, e-mail, adresse de livraison et détails de commande lorsque vous achetez, demandez un devis, postulez pour vendre ou postulez pour livrer ; les messages envoyés via notre chat en direct ; les informations de compte et adresses enregistrées si vous créez un compte ; et, avec votre consentement, des données anonymes d'utilisation du site."],
      ['Pourquoi nous les utilisons', "Pour traiter et livrer les commandes, envoyer des reçus et des informations d'expédition, assurer l'assistance, prévenir la fraude et respecter nos obligations légales."],
      ['Avec qui nous les partageons', "Des prestataires qui nous aident à faire fonctionner la boutique : Flutterwave (paiements), Resend (e-mail), Sanity (notre base de données), Vercel (hébergement), Telegram (chat en direct), Meta WhatsApp (mises à jour de commande que vous choisissez de recevoir), Brevo (e-mail) et les partenaires de livraison. Nous ne vendons pas vos données."],
      ['Cookies et statistiques', "Les cookies de statistiques ne se chargent qu'après votre acceptation. Vous pouvez les refuser et utiliser tout le site."],
      ['Vos droits', "Selon la loi nigériane de 2023 sur la protection des données (NDPA), vous pouvez demander à accéder à vos données, à les corriger ou à les supprimer, ou vous opposer à leur utilisation. Vous pouvez supprimer vous-même vos données de compte enregistrées depuis la page Mon compte, ou nous contacter via les coordonnées en bas de page."],
      ['Conservation', "Nous conservons les dossiers de commande aussi longtemps que nécessaire pour des raisons comptables, de garantie et légales."],
    ] },
    returns: { title: 'Retours et garantie', sections: [
      ['Garantie', "Les produits indiqués avec une garantie sont couverts contre les défauts de fabrication pendant la durée affichée sur la page du produit. Conservez votre facture : c'est votre preuve d'achat."],
      ["Ce qui n'est pas couvert", "Les dommages dus à une mauvaise utilisation, une installation incorrecte, des accidents, une réparation non autorisée ou l'usure normale."],
      ['Articles défectueux ou erronés', "Contactez-nous dans les 48 heures suivant la livraison avec votre référence de commande et des photos. Nous réparerons, remplacerons ou rembourserons l'article."],
      ["Changement d'avis", "Les articles non utilisés, dans leur emballage d'origine, peuvent être retournés dans les 7 jours suivant la livraison, aux frais de l'acheteur, sauf les denrées périssables, les articles d'hygiène comme les couches et lingettes une fois ouverts, et les articles soldés ou des ventes éclair."],
      ['Remboursements', "Les remboursements approuvés sont effectués sur le moyen de paiement d'origine et peuvent prendre plusieurs jours ouvrables."],
      ['Produits frais', 'Signalez tout problème avec des produits frais le jour de la livraison, avec des photos.'],
    ] },
  },
}
