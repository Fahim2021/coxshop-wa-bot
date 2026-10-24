const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
const http = require('http');

let currentQrDataUrl = '';
let isConnected = false;

// Cox Shop BD er shompurno product catalog
const productCatalog = {
    trial_shutki: {
        keywords: ['বাজেট', 'ট্রায়াল', 'trial', 'budget', '৫০০ গ্রাম', '500g', '500 gm'],
        response: `📦 বাজেট ফ্রেন্ডলি শুঁটকি ট্রায়াল কম্বো (৫০০ গ্রাম) – অরিজিনাল কক্সবাজার নাজিরারটেক স্পেশাল
• প্যাকেজে থাকছে: লইট্টা (১২৫ গ্রাম), ছোট ছুড়ি (১২৫ গ্রাম), ছোট চিংড়ি (১২৫ গ্রাম), মধু ফাইস্যা (১২৫ গ্রাম)।
• ১০০% বিষ ও কেমিক্যালমুক্ত, মিষ্টি রোদে শুকানো ফ্রেশ শুঁটকি।
• রেগুলার প্রাইজ: ৮৯৯/- টাকা
🔥 অফার প্রাইজ: মাত্র ৭৯৯/- টাকা!
🛒 অর্ডার করতে আপনার নাম, মোবাইল নম্বর ও পূর্ণ ঠিকানা লিখে মেসেজ দিন।`
    },
    bhuna_shutki: {
        keywords: ['ভুনা', 'ভোনা', 'bhuna', 'ভুনা শুঁটকি', 'ট্র্যাডিশনাল', 'traditional', 'চাটগাঁইয়া ভুনা'],
        response: `📦 ট্র্যাডিশনাল চাটগাঁইয়া ভুনা শুঁটকি কম্বো (১ কেজি) – অরিজিনাল কক্সবাজার নাজিরারটেক
• প্যাকেজে থাকছে: মাঝারি ছুড়ি (২৫০ গ্রাম), বড় লইট্টা (২৫০ গ্রাম), ওলুয়া মাছ (২৫০ গ্রাম), ছোট চিংড়ি (২৫০ গ্রাম)।
• আসল চাটগাঁইয়া শুঁটকি ভুনার পারফেক্ট স্বাদ।
• রেগুলার প্রাইজ: ১৩৯৯/- টাকা
🔥 অফার প্রাইজ: মাত্র ১২৯৯/- টাকা!
🛒 অর্ডার করতে নাম, মোবাইল নম্বর ও ঠিকানা পাঠান।`
    },
    vorta_shutki: {
        keywords: ['ভর্তা', 'ঝাল ভর্তা', 'vorta', 'spicy vorta', 'ভর্তা কম্বো'],
        response: `📦 স্পেশাল ঝাল ভর্তা শুঁটকি কম্বো (১ কেজি) – অরিজিনাল কক্সবাজার নাজিরারটেক
• প্যাকেজে থাকছে: লোকাল লইট্টা (২৫০ গ্রাম), ছোট ছুড়ি (২৫০ গ্রাম), ছোট চিংড়ি (২৫০ গ্রাম), মধু ফাইস্যা (২৫০ গ্রাম)।
• গরম ভাতের সাথে ঝাল ঝাল চাটগাঁইয়া শুঁটকি ভর্তার জন্য সেরা।
• রেগুলার প্রাইজ: ১২৯৯/- টাকা
🔥 অফার প্রাইজ: মাত্র ১১৯৯/- টাকা!
🛒 অর্ডার করতে নাম ও সম্পূর্ণ ঠিকানা মেসেজ দিন।`
    },
    mega_shutki: {
        keywords: ['মেগা', 'mega', 'সী-ফুড', 'seafood', 'প্রিমিয়াম শুঁটকি', 'রূপচাঁদা', 'rupchanda'],
        response: `📦 প্রিমিয়াম সী-ফুড মেগা শুঁটকি কম্বো (১ কেজি) – অরিজিনাল কক্সবাজার নাজিরারটেক স্পেশাল
• প্যাকেজে থাকছে: বড় লইট্টা (২৫০ গ্রাম), বড় ছুড়ি (২৫০ গ্রাম), বড় চিংড়ি (২৫০ গ্রাম), মিনি রূপচাঁদা (২৫০ গ্রাম)।
• নাজিরারটেকের সেরা ৪টি শুঁটকি এক প্যাকেজে।
• রেগুলার প্রাইজ: ১৬৯৯/- টাকা
🔥 বিশেষ অফার প্রাইজ: মাত্র ১৪৯৯/- টাকা!
🛒 অর্ডার করতে আপনার বিবরণ লিখে মেসেজ দিন।`
    },
    burmese_achar: {
        keywords: ['আচার', 'achar', 'বার্মিজ আচার', 'মিক্সড আচার', 'pickle', 'tok achar', 'jhal achar'],
        response: `🥭 প্রিমিয়াম বার্মিজ মিক্সড আচার কম্বো প্যাক (Burmese Special Achar Combo)
• কক্সবাজারের বিখ্যাত ৪টি ভিন্ন জনপ্রিয় ফ্লেভারের বার্মিজ আচার।
• দাম: ৪৫/- টাকা থেকে ১৬৯/- টাকা (প্যাক সাইজ অনুযায়ী)।
🛒 অর্ডার করতে বা বিস্তারিত জানতে মেসেজ দিন।`
    },
    bio_collagen_mask: {
        keywords: ['bio-collagen', 'collagen mask', 'কলাজেন', 'মাস্ক', 'mask', 'real deep mask'],
        response: `✨ Bio-Collagen Real Deep Mask
• ত্বকের গভীরে পুষ্টি জোগায় ও স্কিন টাইট ও গ্লোয়িং করতে সাহায্য করে।
• ক্যাটাগরি: বার্মিজ কসমেটিকস
• রেগুলার প্রাইজ: ৩৯৯/- টাকা
🔥 অফার প্রাইজ: মাত্র ২৯৯/- টাকা!`
    },
    asantee_soap: {
        keywords: ['asantee', 'asanter', 'আসান্তি', 'goat milk', 'হালকা সাবান', 'তেঁতুল সাবান', 'সাবান'],
        response: `🧼 অরিজিনাল Asantee Tamarind & Goat Milk Herbal Soap (125g)
• স্কিন লাইটেনিং ও ব্রাইটনিং ভেষজ সাবান। প্রাকৃতিক তেঁতুল ও ছাগলের দুধ সমৃদ্ধ।
• রেগুলার প্রাইজ: ২৮০/- টাকা
🔥 অফার প্রাইজ: মাত্র ২২৯/- টাকা!`
    },
    bee_flower_soap: {
        keywords: ['bee & flower', 'bee and flower', 'চন্দন সাবান', 'sandalwood soap'],
        response: `🧼 অরিজিনাল Bee & Flower চন্দন সাবান (Original Sandalwood Soap)
• দীর্ঘস্থায়ী প্রাকৃতিক চন্দনের সুবাস ও স্কিনের কোমলতা রক্ষা করে।
• দাম: ২৪০/- টাকা থেকে ৮৮০/- টাকা (সাইজ ও সেট অনুযায়ী)।`
    },
    original_thanaka: {
        keywords: ['অরিজিনাল বার্মিজ থানাকা', 'original burmese thanaka', 'কাঁচা থানাকা', 'ন্যাচারাল থানাকা', 'thanaka'],
        response: `🌿 অরিজিনাল বার্মিজ থানাকা (Original Burmese Thanaka) – ন্যাচারাল স্কিন কেয়ার
• মায়ানমারের শতবর্ষী খাঁটি ঐতিহ্যবাহী রূপচর্চার উপাদান। ত্বক ঠান্ডা রাখে ও দাগ দূর করে।
• রেগুলার প্রাইজ: ৫৫০/- টাকা
🔥 অফার প্রাইজ: মাত্র ৪৫০/- টাকা!`
    },
    thanaka_lotion_75ml: {
        keywords: ['myat bhoon pwint', 'myat', 'হোয়াইটেনিং লোশন', '৭৫ মিলি', '75ml'],
        response: `🧴 অরিজিনাল মায়ানমার Myat Bhoon Pwint থানাকা হোয়াইটেনিং লোশন (75ml)
• স্কিনকে উজ্জ্বল, মসৃণ ও দাগহীন রাখতে সাহায্যকারী থানাকা লোশন।
• রেগুলার প্রাইজ: ২২০/- টাকা
🔥 অফার প্রাইজ: মাত্র ১৪৯/- টাকা!`
    },
    shwe_pyi_nann_lotion: {
        keywords: ['shwe pyi nann lotion', 'বডি লোশন', 'body lotion', 'চন্দন বডি লোশন', '200ml'],
        response: `🧴 অরিজিনাল মায়ানমার Shwe Pyi Nann থানাকা ও চন্দন বডি লোশন (200ml)
• থানাকা এবং খাঁটি চন্দনের মিশ্রণে তৈরি প্রিমিয়াম বডি লোশন। ত্বক নরম ও সুবাসিত রাখে।
• রেগুলার প্রাইজ: ৪০০/- টাকা
🔥 অফার প্রাইজ: মাত্র ৩৩৯/- টাকা!`
    },
    thanaka_cake_bar: {
        keywords: ['কেক বার', 'cake bar', 'shwe pyi nann cake', 'থানাকা বার'],
        response: `🧼 অরিজিনাল মায়ানমার থানাকা কেক বার – Shwe Pyi Nann Natural Thanaka
• প্রাকৃতিক থানাকা পেস্টের মতো সহজে ব্যবহারযোগ্য কেক বার। ব্রণ ও রোদে পোড়া দাগ দূর করতে সহায়ক।
• রেগুলার প্রাইজ: ১৮০/- টাকা
🔥 অফার প্রাইজ: মাত্র ১৪৯/- টাকা!`
    }
};

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('baileys_auth');
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            currentQrDataUrl = await QRCode.toDataURL(qr);
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            isConnected = false;
            if (shouldReconnect) {
                startBot();
            }
        } else if (connection === 'open') {
            isConnected = true;
            currentQrDataUrl = '';
            console.log('WhatsApp Bot সফলভাবে যুক্ত হয়েছে এবং চালু আছে!');
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const sender = msg.key.remoteJid;
        const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').toLowerCase().trim();

        const reply = async (replyText) => {
            await sock.sendMessage(sender, { text: replyText });
        };

        // ১. ওয়েবসাইট থেকে আসা ডিরেক্ট বাটন মেসেজসমূহ
        if (text.includes('আপনাদের হোটেলে একটি রুম বুকিং করতে চাচ্ছিলাম') || text.includes('রুম বুকিং করতে চাচ্ছিলাম') || (text.includes('হোটেল') && text.includes('বুকিং'))) {
            return await reply(`🏨 *কক্সবাজার হোটেল রুম বুকিং সার্ভিস*\n\nকক্সবাজারে আপনার ভ্রমণকে আরামদায়ক করতে আমাদের সাথে যুক্ত প্রিমিয়াম হোটেল ও রিসোর্টে রুম বুকিং করতে পারেন।\n\nরুম বুকিং কনফার্ম করতে নিচের তথ্যগুলো পাঠান:\n১. *চেক-ইন তারিখ:*\n২. *চেক-আউট তারিখ:*\n৩. *মোট অতিথি সংখ্যা:*\n৪. *রুমের ক্যাটাগরি:* (Couple Deluxe / Family Suite / Sea View AC)\n৫. *আপনার নাম ও মোবাইল নম্বর:*`);
        }

        if (text.includes('এয়ার অথবা বাস টিকিট বুকিং করতে চাচ্ছিলাম') || text.includes('সিট অ্যাভেইলেবিলিটি সম্পর্কে জানা যাবে কি') || text.includes('টিকিট বুকিং')) {
            return await reply(`✈️🚌 *ঢাকা-কক্সবাজার রুটের এয়ার ও বাস টিকিট বুকিং সার্ভিস*\n\nআমাদের মাধ্যমে সহজে এয়ারলাইন্স ও বাসের টিকিট বুক করুন।\n\nবুকিংয়ের তথ্য পাঠান:\n১. *ভ্রমণের মাধ্যম:* (এয়ার / বাস)\n২. *যাত্রার তারিখ ও সময়:*\n৩. *রুট:* (ঢাকা-কক্সবাজার / কক্সবাজার-ঢাকা)\n৪. *যাত্রী সংখ্যা:*\n৫. *বাসের ক্যাটাগরি:* (AC Sleeper / Business / Economy)\n৬. *আপনার নাম ও মোবাইল নম্বর:*`);
        }

        // ২. নির্দিষ্ট প্রোডাক্ট চেক
        for (const key in productCatalog) {
            const item = productCatalog[key];
            if (item.keywords.some(k => text.includes(k.toLowerCase()))) {
                return await reply(item.response);
            }
        }

        // ৩. অর্ডার কনফার্মেশন ও পেমেন্ট
        const orderKeywords = ['order', 'অর্ডার', 'নিতে চাই', 'কিনতে চাই', 'নিতে চায়', 'নেব', 'নেবো', 'দিতে চাই', 'কনফার্ম', 'confirm'];
        if (orderKeywords.some(k => text.includes(k))) {
            return await reply(`📦 *Cox Shop BD - অর্ডার কনফার্মেশন ও পেমেন্ট বিবরণ*\n\nঅর্ডারটি কনফার্ম করতে তথ্যগুলো পাঠান:\n১. *প্রোডাক্টের নাম ও পরিমাণ:*\n২. *আপনার নাম:*\n৩. *মোবাইল নম্বর:*\n৪. *বিকল্প মোবাইল নম্বর (যদি থাকে):*\n৫. *সম্পূর্ণ ঠিকানা:* (গ্রাম/মহল্লা, থানা/উপজেলা, জেলা)\n\n---\n🚚 *ডেলিভারি চার্জ বিবরণ (হোম ডেলিভারি):*\n• কক্সবাজার শহরের ভেতরে: ৭০/- টাকা\n• কক্সবাজারের বাইরে সারাদেশে: ১৩০/- টাকা\n\n---\n💳 *পেমেন্ট অপশন:*\n১. ক্যাশ অন ডেলিভারিতে অর্ডার কনফার্ম করতে ডেলিভারি চার্জ অগ্রিম দিতে হবে। বাকি টাকা প্রোডাক্ট হাতে পেয়ে পরিশোধ করবেন।\n২. চাইলে সম্পূর্ণ টাকা একসাথে পরিশোধ করে দিতে পারেন।\n\n📱 *পার্সোনাল নম্বর (Send Money):*\n• *bKash / Nagad / Upay:* 01619915414\n\nটাকা পাঠানোর পর লাস্ট ৪ ডিজিট পাঠিয়ে দিন।`);
        }

        // ৪. মেনু ও প্রাইস
        if (text.includes('দাম') || text.includes('price') || text.includes('অফার') || text.includes('মেনু') || text.includes('লিস্ট')) {
            return await reply(`আসসালামু আলাইকুম! Cox Shop BD-তে স্বাগতম।\n\n১. অথেনটিক শুঁটকি কম্বো (৭৯৯/- থেকে ১৪৯৯/- টাকা)\n২. অরিজিনাল বার্মিজ কসমেটিকস ও থানাকা (১৪৯/- থেকে ৪৫০/- টাকা)\n৩. প্রিমিয়াম বার্মিজ স্পেশাল আচার (৪৫/- থেকে ১৬৯/- টাকা)\n৪. হোটেল রুম বুকিং ও ঢাকা-কক্সবাজার টিকিট সার্ভিস\n\nযেকোনো প্রোডাক্টের নাম লিখে মেসেজ দিন।\nওয়েবসাইট: https://coxshopbd.com`);
        }

        // ৫. সম্ভাষণ
        const greetings = ['সালাম', 'আসসালামু', 'আলাইকুম', 'স্লাম', 'হাই', 'হ্যালো', 'salam', 'hi', 'hello', 'hlw', 'hey'];
        if (greetings.some(k => text.includes(k))) {
            return await reply('আসসালামু আলাইকুম! Cox Shop BD-তে স্বাগতম। বিষমুক্ত শুঁটকি, বার্মিজ থানাকা, কসমেটিকস ও বুকিং সার্ভিসের বিস্তারিত জানতে নির্দিষ্ট পণ্য বা সার্ভিসের নাম লিখে মেসেজ দিন।');
        }
    });
}

startBot();

// HTTP Server
const port = process.env.PORT || 10000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    if (isConnected) {
        res.end(`
            <div style="text-align:center; padding:50px; font-family:sans-serif;">
                <h2 style="color:green;">✅ WhatsApp Bot সফলভাবে যুক্ত হয়েছে এবং চালু আছে!</h2>
                <p>এখন আপনার পিসি বন্ধ থাকলেও বট ২৪/৭ কাজ করবে।</p>
            </div>
        `);
    } else if (currentQrDataUrl) {
        res.end(`
            <div style="text-align:center; padding:30px; font-family:sans-serif;">
                <h2>Cox Shop BD - WhatsApp Bot Login</h2>
                <p>মোবাইল থেকে <b>Linked Devices</b> খুলে নিচের QR কোডটি স্ক্যান করুন:</p>
                <img src="${currentQrDataUrl}" alt="WhatsApp QR Code" style="border:10px solid #f0f0f0; border-radius:8px;" />
                <p style="color:gray; font-size:13px;">(পৃষ্ঠাটি প্রতি ২০ সেকেন্ড পর রিফ্রেশ হবে)</p>
                <script>setTimeout(() => { window.location.reload(); }, 20000);</script>
            </div>
        `);
    } else {
        res.end(`
            <div style="text-align:center; padding:50px; font-family:sans-serif;">
                <h3>QR কোড তৈরি হচ্ছে, অনুগ্রহ করে ৫-১০ সেকেন্ড অপেক্ষা করুন...</h3>
                <script>setTimeout(() => { window.location.reload(); }, 5000);</script>
            </div>
        `);
    }
}).listen(port, () => console.log(`Server listening on port ${port}`));
