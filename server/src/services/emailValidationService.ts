import validator from 'validator'
import dns from 'dns/promises'
import { v4 as uuidv4 } from 'uuid'

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwawaymail.com',
  'yopmail.com', 'maildrop.cc', 'getnada.com', '10minutemail.com',
  'temp-mail.org', 'fakeinbox.com', 'trashmail.com', 'sharklasers.com',
  'burnermail.io', 'spamgourmet.com', 'mailnator.com', 'dispostable.com',
  'tempemail.net', 'mailmetrash.com', 'mailexpire.com', 'mailsac.com',
  'tempinbox.com', 'spambox.us', 'thankyou2010.com', 'trash2009.com',
  'mailcatch.com', 'tempalias.com', 'guerrillamail.org', 'guerrillamail.net',
  'guerrillamail.biz', 'grr.la', 'dodgeit.com', 'emailias.com',
  'sneakemail.com', 'spam.la', 'spamavert.com', 'spamdecoy.net',
  'spamex.com', 'spamgourmet.com', 'spamhole.com', 'spammotel.com',
  'spamobox.com', 'spamserver.net', 'tempemail.co.za', 'trashymail.com',
  'tyldd.com', 'uglyscholar.com', 'upliftnow.com', 'bottube.net',
  'brickforest.com', 'browniesgoreng.com', 'bolehvpn.net', 'bugmenot.com',
  'bum.net', 'bundy.lol', 'buyusedlibrarybooks.com', 'card.zp.ua',
  'casualdx.com', 'chasepoker.com', 'cheaphub.net', 'chibakenma.ml',
  'chicagodogs.org', 'choco.la', 'christopherfretz.com', 'cistron.nl',
  'ckng.xyz', 'cl-cl.org', 'cl0ne.net', 'clandest.in',
  'clinicatufar.com', 'cloud-mail.xyz', 'clubfans.com', 'diplomats.com',
  'dmail.kyal.pl', 'dspwebservices.com', 'duck.com', 'dumbx.com',
  'dump-email.info', 'dumpmail.de', 'dumpyemail.com',
  'e-mail.com', 'e-mail.yap.rb3', 'e4ward.com', 'easytrashmail.com',
  'ecocrypt.com', 'egg-eggs.com', 'ekpost.de', 'elmajormp3.xyz',
  'email-fake.com', 'email.cbes.net', 'email.net', 'emailage.org',
  'emailfake.com', 'emailgo.de', 'emailias.com', 'emails.ga',
  'emailtemporario.com.br', 'emailto.de', 'emailwarden.com',
  'epb.ro', 'erep.info', 'evopo.com', 'fakemail.com',
  'fakemail.fr', 'fakemyinbox.com', 'fammix.com', 'fansworldwide.de',
  'fantasymail.de', 'farrse.co.uk', 'fastacura.com', 'fastchevy.com',
  'fastchrysler.com', 'fasternet.biz', 'fastkawasaki.com', 'fastmazda.com',
  'fastmitsubishi.com', 'fastnissan.com', 'fastsubaru.com', 'fastsuzuki.com',
  'fasttoyota.com', 'fastyamaha.com', 'fatflap.com', 'fdgdfgdfgd.ddns.net',
  'fdfdsfds.ddns.info', 'fer-gabriel.org', 'fermaxxi.com', 'ficken.cc',
  'financial-links.com', 'findu.pl', 'fingermail.org', 'fivemail.de',
  'fixmail.tk', 'fizmail.com', 'fleckens.hu', 'flurrys.de', 'flyspam.com',
  'footard.com', 'forgetmail.com', 'four.fackcom.net', 'free-email.ga',
  'freebulkemail.org', 'freeemail.ga', 'freemail.ga', 'freemymail.com',
  'friendlymail.co.uk', 'frostcube.com', 'fudgerub.com', 'fux0rduck.org',
  'fyii.xyz', 'gafy.net', 'garrymccooey.com', 'gmail.com', 'gmx.com',
  'goemail.com', 'gurlmail.com', 'h8s.org', 'haltospam.com',
  'hatespam.org', 'herrain.com', 'hidemail.de', 'hidemyass.com',
  'hotmail.com', 'hushmail.com', 'i-phone.ga', 'imails.info',
  'inbox.com', 'inboxalias.com', 'inboxbear.com', 'inoutmail.de',
  'internetbiz.xyz', 'ip6.li', 'irish2man.com', 'jmail.fr.ht',
  'jollyfree.xyz', 'jourrapide.com', 'kabin.co.uk', 'kadokawa.men',
  'kaspop.com', 'kekita.com', 'kemska.pw', 'khosrova.net',
  'killmail.net', 'killmail.ru', 'kuai9090.com', 'kulturbet.de',
  'laoeq.com', 'last-chance.xyz', 'lazyinbox.us', 'letterboxes.org',
  'linuxmail.so', 'list.ru', 'lopl.co.cc', 'loveme.com',
  'lpfmgmtltd.com', 'lr7.us', 'lroid.com', 'lukecarriere.com',
  'luv2.us', 'm4ilweb.info', 'ma1l.biz', 'mail-cart.com',
  'mail-filter.com', 'mail-temp.com', 'mail.by', 'mail.ru',
  'mail2rss.org', 'mail333.com', 'mail4trash.com', 'mailbidon.com',
  'mailbiz.biz', 'mailblocks.com', 'mailbucket.org', 'mailcat.biz',
  'mailcatch.com', 'mailde.de', 'mailde.info', 'maildrop.cc',
  'maildu.de', 'maildx.com', 'maileater.com', 'mailexpire.com',
  'mailfa.tk', 'mailfall.com', 'mailforspam.com', 'mailfree.ga',
  'mailfree.gq', 'mailgw.com', 'mailhazard.com', 'mailhazard.us',
  'mailimate.com', 'mailin8r.com', 'mailinatar.com', 'mailinater.com',
  'mailinator.co.uk', 'mailinator.com', 'mailinator.gq', 'mailinator.info',
  'mailinator.net', 'mailinator.org', 'mailinator.us', 'mailinator.usa.cc',
  'mailinator.xyz', 'mailinator2.com', 'mailincubator.com', 'mailismagic.com',
  'mailjolt.net', 'mailmate.com', 'mailme.ga', 'mailme.gq',
  'mailmetrash.com', 'mailmoat.com', 'mailmoth.com', 'mailnator.com',
  'mailnesia.com', 'mailnull.com', 'mailops.com', 'mailorg.org',
  'mailosaur.com', 'mailox.fun', 'mailpick.biz', 'mailproxsy.com',
  'mailquack.com', 'mailrock.biz', 'mailsac.com', 'mailscdn.com',
  'mailseal.de', 'mailshell.com', 'mailshiv.com', 'mailslite.com',
  'mailsword.com', 'mailtemp.net', 'mailtome.de', 'mailtothis.com',
  'mailtraps.com', 'mailtrash.net', 'mailtv.net', 'mailtv.tv',
  'mailzi.ru', 'mailzilla.com', 'mailzilla.org', 'makemetheking.com',
  'manybrain.com', 'mchardy.org', 'mega.zik.dj', 'meinspamschutz.de',
  'meltmail.com', 'messagebeamer.de', 'messwiththebestdielikethe.rest',
  'mhdsl.com', 'midcoastcustoms.com', 'midcoastcustoms.net',
  'midlertidig.com', 'mijnhva.nl', 'ministry-of-silly-walks.de',
  'mintakore.ga', 'minty-email.com', 'miraclemakers.com', 'mirrorrr.asia',
  'mjukglass.nu', 'moakt.com', 'mobileninja.co.uk', 'moldova.cc',
  'mrvpm.net', 'msa.minsmail.com', 'mt2009.com', 'mt2014.com',
  'my-cat.net', 'my-mail.in', 'my10minutemail.com', 'mycard.net.ve',
  'mycleaninbox.net', 'myemailboundless.net', 'myindohome.com', 'myinterserver.ml',
  'mymail24.de', 'mymailoasis.com', 'mynetstore.de', 'myopang.com',
  'mypacks.net', 'mypomel.com', 'mysamp.de', 'myspaceinc.com',
  'myspaceinc.net', 'myspaceinc.org', 'myspacepete.com', 'mytrashmail.com',
  'mywarnernet.net', 'myzx.de', 'nakedtruth.biz', 'nandor.net',
  'neben.de', 'negated.com', 'neomailbox.com', 'neverbox.com',
  'no-spam.ws', 'noblepioneer.com', 'nobulk.com', 'noclickemail.com',
  'nogmailspam.info', 'nomail.xl.cx', 'nomail2me.com', 'nomorespamemails.com',
  'nonspam.eu', 'nonspammer.de', 'noref.fr', 'nospam.ze.tc',
  'nospam4.us', 'nospamfor.us', 'nospamthanks.info', 'notrnailinator.com',
  'nowmymail.com', 'ntlhelp.net', 'nurfuerspam.de', 'o.cfo2go.usa.cc',
  'objectmail.com', 'obobbo.com', 'odnorazovoe.ru', 'oepia.com',
  'ohhmymail.com', 'oil.y0.pl', 'olypmall.ru', 'one-mail.ml',
  'oneoffemail.com', 'oneoffmail.com', 'onewaymail.com', 'onlatedotcom.info',
  'online.ms', 'ookpost.com', 'opayq.com', 'opp24.com',
  'ordinaryamerican.net', 'otherinbox.com', 'ourklips.com', 'outlawspam.com',
  'ovpn.to', 'ozyl.de', 'pa9e.com', 'pacmeas.com',
  'pancies.com', 'paparazzistudio.net', 'paplease.com', 'passwrdcrack.com',
  'pastebitch.com', 'pavilionx2.com', 'pechkin.com', 'pedacan.com',
  'penis.goes.in', 'pfui.ru', 'phonearea.info', 'photo-impact.eu',
  'photomark.net', 'pi.vu', 'pig.pp.ua', 'pimpedupmyspace.com',
  'pjjkp.com', 'plexolan.de', 'plhk.ru', 'plw.me',
  'poj.com', 'pokemail.net', 'politikerclub.de', 'pooae.com',
  'poofy.org', 'pookmail.com', 'prin.be', 'privy-mail.com',
  'privymail.de', 'promail.send4u.org', 'proxymail.space', 'prtnx.com',
  'prtz.eu', 'puppetmail.de', 'purple.iwz.one', 'pwrby.com',
  'qasti.com', 'qisdo.com', 'qisoa.com', 'quickinbox.com',
  'quickmail.nl', 'r52.ml', 'radiodale.com', 'rainbowly.ml',
  'rancidhome.net', 'rblxhub.com', 'reallymymail.com', 'receiveee.com',
  'receivefree.es', 'receivemail.co', 'recode.me', 'reconmail.com',
  'recursor.net', 'recyclemail.dk', 'reddit.usa.cc', 'redfeathercrow.com',
  'redirect2email.com', 'reftoken.net', 'regbypass.com', 'regspaces.tk',
  'renaultclio.ga', 'reng.pp.ua', 'reusecc.com', 'rm2rf.com',
  'rppkn.com', 'rtrtr.com', 's0ny.net', 'safe-mail.net',
  'safersignup.com', 'safersignup.de', 'safetymail.info', 'safetypost.de',
  'sandelf.de', 'saynotospams.com', 'scafh.net', 'scatmail.com',
  'schachrolf.de', 'schafmail.de', 'schmeissweg.tk', 'scour.xyz',
  'sd3.in', 'secretemail.de', 'secure-mail.biz', 'secure-mail.cc',
  'secured-link.net', 'seekapps.com', 'selfdestructingmail.com', 'sendingspecialflyers.com',
  'sendspamhere.com', 'senseless-entertainment.com', 'servermaps.net', 'services391.com',
  'sharphat.com', 'shhmail.com', 'shhuut.org', 'shieldedmail.com',
  'shmeriously.com', 'shortmail.net', 'shotmail.ru', 'showslow.de',
  'sibmail.com', 'sinnlos-mail.de', 'siteposter.com', 'skeefmail.com',
  'slapsfromlastnight.com', 'slaskpost.se', 'slave-auctions.net', 'slippery.email',
  'slopsbox.com', 'slushmail.com', 'sly.io', 'smapfree24.com',
  'smapfree24.de', 'smapfree24.eu', 'smapfree24.info', 'smapfree24.org',
  'smarttalentllc.com', 'smashmail.de', 'smellfear.com', 'smellrear.com',
  'snakware.com', 'snapunit.com', 'sneakemail.com', 'sneakmail.de',
  'snkmail.com', 'social-mailer.com', 'softpls.asia', 'sogetthis.com',
  'sohus.cn', 'soioa.com', 'solar-impact.com', 'sons.cf',
  'soodomail.com', 'soodonims.com', 'soon.it', 'space-club.com',
  'spam-be-gone.com', 'spam.2012-2016.ru', 'spam4.me', 'spamavert.com',
  'spambob.com', 'spambob.net', 'spambob.org', 'spambog.com',
  'spambog.de', 'spambog.net', 'spambog.ru', 'spambox.info',
  'spambox.me', 'spambox.org', 'spambox.us', 'spamcero.com',
  'spamcon.org', 'spamcorptastic.com', 'spamcowboy.com', 'spamcowboy.net',
  'spamcowboy.org', 'spamday.com', 'spamdecoy.net', 'spamex.com',
  'spamfree24.com', 'spamfree24.de', 'spamfree24.eu', 'spamfree24.info',
  'spamfree24.net', 'spamfree24.org', 'spamgoes.in', 'spamgourmet.com',
  'spamgourmet.net', 'spamgourmet.org', 'spamherelots.com', 'spamhereplease.com',
  'spamhole.com', 'spamify.com', 'spaminator.de', 'spamkill.info',
  'spaml.com', 'spamlot.net', 'spammotel.com', 'spamobox.com',
  'spamols.com', 'spamout.net', 'spamkill.info', 'spamsalad.in',
  'spamserver.de', 'spamserver.net', 'spamserver.org', 'spamslicer.com',
  'spamsphere.com', 'spamstack.net', 'spamspot.com', 'spamtrail.com',
  'spamtroll.net', 'spamvertise.net', 'spamwc.de', 'spamwc.eu',
  'spamwc.info', 'spamwc.org', 'sparty.life', 'spazmail.com',
  'speed.1s.fr', 'sperke.net', 'spikio.com', 'spoofmail.de',
  'squizzy.de', 'squizzy.eu', 'squizzy.net', 'sry.li',
  'ssl.tls.email', 'starlight-breaker.net', 'starpower.space', 'startfu.com',
  'startkeys.com', 'statdvr.com', 'stathost.net', 'stati.ga',
  'stealthmail.com', 'stinkefinger.net', 'stop-my-spam.com', 'stopdropandroll.com',
  'storj99.com', 'strowler.com', 'stumpfwerk.com', 'suckmyd.com',
  'sugar-match.com', 'super-auswahl.de', 'supergreatmail.com', 'supermailer.jp',
  'superrito.com', 'superstachel.de', 'suremail.info', 'svip520.cn',
  'svk.jp', 'svxr.org', 'sweetb.it', 'sweetxxx.de',
  'swift10minutemail.com', 't.psh.me', 'tafmail.com', 'tagmymail.com',
  'tagyourself.com', 'talkinator.com', 'tapchicuoihoi.com', 'tarzanmail.com',
  'techemail.com', 'techgroup.me', 'teewars.org', 'teflon-rohr.xyz',
  'telecomix.pl', 'teleosaurs.xyz', 'temp-mail.com', 'temp-mail.de',
  'temp-mail.org', 'temp-mail.ru', 'temp.emeraldwebmail.com', 'tempail.com',
  'tempalias.com', 'tempe-mail.com', 'tempemail.biz', 'tempemail.co.za',
  'tempemail.com', 'tempemail.net', 'tempinbox.co.uk', 'tempinbox.com',
  'tempmail.co', 'tempmail.de', 'tempmail.eu', 'tempmail.it',
  'tempmail.net', 'tempmail.org', 'tempmail.us', 'tempmail.xyz',
  'tempmailo.com', 'tempmails.org', 'tempomail.fr', 'temporarily.de',
  'temporarioemail.com.br', 'temporaryemail.net', 'temporaryemail.us',
  'temporaryforwarding.com', 'temporaryinbox.com', 'temporarymail.co',
  'temporarymail.io', 'temporarymail.org', 'temporarymailbox.com',
  'thankyou2010.com', 'theaviors.com', 'thebearshark.com', 'thecurious.xyz',
  'thejoe5.com', 'themailpro.net', 'thembones.com.au', 'themicrobusiness.org',
  'thescrappermovie.com', 'theteastory.info', 'thetruthhurts.info',
  'thiscat.net', 'thisisnotmyrealemail.com', 'thraml.com', 'thrott.com',
  'throwam.com', 'throwaway.email', 'throwaway.io', 'throwaway.mailinator.com',
  'throwaway.xyz', 'throwawayemail.com', 'throya.com', 'thunkinator.org',
  'tittibit.net', 'tmail.com', 'tmail.ws', 'tmailinator.com',
  'toiea.com', 'tokem.co', 'tokenmail.de', 'tonymanso.com',
  'toomail.biz', 'top1mail.ru', 'top77.net', 'top9appz.info',
  'topchat.com', 'topinrock.cf', 'topranklist.de', 'tormail.net',
  'tormail.org', 'toss.pw', 'totalvista.com', 'totoan.net',
  'toughlife.ga', 'trash-amil.com', 'trash-me.com', 'trash2009.com',
  'trash247.com', 'trash2009.com', 'trashbox.eu', 'trashcanmail.com',
  'trashdevil.com', 'trashdevil.de', 'trashemail.de', 'trashify.org',
  'trashmail.at', 'trashmail.com', 'trashmail.de', 'trashmail.ga',
  'trashmail.gq', 'trashmail.io', 'trashmail.me', 'trashmail.net',
  'trashmail.org', 'trashmail.ws', 'trashmailer.com', 'trashmails.com',
  'trashymail.com', 'trashymail.net', 'trayna.com', 'trbvm.com',
  'tri-cops.com', 'trickmail.net', 'trillianpro.com', 'trimsj.com',
  'trumpmail.com', 'tryalert.com', 'tualias.com', 'tuofs.com',
  'turbify.net', 'turual.com', 'twinmail.de', 'twkly.ml',
  'two.solutions', 'tyldd.com', 'typpm.de', 'uacro.com',
  'ubismail.net', 'ubm.md', 'uggsrock.com', 'uglyscholar.com',
  'ukqwd.xyz', 'uku.6a67.uberspace.de', 'umail.net', 'undo.it',
  'unmail.ru', 'upliftnow.com', 'uplipht.com', 'uploadboy.com',
  'urfunktion.se', 'uroid.com', 'us.af', 'us.to',
  'usa.cc', 'utflik.com', 'uu.gl', 'uuyy.biz',
  'uyhip.com', 'v1.dhaval.tech', 'valemail.net',
  'valuetable.com', 'vanjack.com', 'vankin.de', 'vctel.com',
  'vefblogg.no', 'vektik.com', 'venompen.com', 'ver0.cf',
  'ver0.ga', 'ver0.gq', 'ver0.ml', 'ver0.tk',
  'vercelli.ga', 'verdejo.com', 'vgy.de', 'victime.ninja',
  'victoriantwins.com', 'vidchart.com', 'viditag.com', 'viewcastmedia.com',
  'viewcastmedia.net', 'vinernet.com', 'violin24.ga', 'vipmail.name',
  'vipmail.pw', 'visto.buzz', 'vjtimail.com', 'vkcode.ru',
  'vmail.co', 'vmail.me', 'vmail99.com', 'vmani.com',
  'vmode.net', 'vnedu.me', 'voidbay.com', 'voltaer.com',
  'vomoto.com', 'vorga.org', 'votiputox.org', 'voxelcore.com',
  'vpn-mail.com', 'vps30.com', 'vps911.net', 'vradportal.com',
  'vremonte.xyz', 'vuabai.mobi', 'vubby.com', 'vuiy.pw',
  'vvalo.pw', 'vxmail.xyz', 'w3internet.co.uk', 'w3pages.com',
  'wakingupesther.com', 'walala.org', 'walkmail.net', 'walkmail.ru',
  'wankinho.com', 'want2lov.e.atomic.green', 'wantplay.xyz', 'warau-kadiri.com',
  'warimail.com', 'wasd.dropmail.me', 'wazabi.club', 'wbdet.com',
  'we.qq', 'web-contact.info', 'web-emailbox.eu', 'web-mail.pp.ua',
  'web2mailco.com', 'webcontact-france.eu', 'webemail.me', 'webemailtop.com',
  'webmaill.com', 'webmail.ml', 'webmailcities.com', 'webmails.top',
  'websitemail.ga', 'webspam.com', 'webstedet.com', 'webtrip.ch',
  'webuser.in', 'wee.my', 'wefjo.grn.cc', 'weg-werf-email.de',
  'wegwerf-email.net', 'wegwerf.email', 'wegwerfadresse.de', 'wegwerfemail.com',
  'wegwerfemail.de', 'wegwerfmail.de', 'wegwerfmail.net', 'wegwerfmail.org',
  'wegwerpmailadres.nl', 'wem.com', 'westnet.ga', 'wetrainbayarea.com',
  'wfaker.com', 'wg0.com', 'wh4f.org', 'whatiaas.com',
  'whatifis.com', 'whenfreedom.com', 'whispy.org', 'wholesaleelec.com',
  'wicked.cricket', 'widaryanto.info', 'wilemail.com', 'willhackforfood.biz',
  'willselfdestruct.com', 'wimsg.com', 'winmail.ga', 'winmail.gq',
  'winmail.ml', 'winning.com', 'wins.com.br', 'wlistp.com',
  'wlszambrow.pl', 'wmik.org', 'wmkrimin.al', 'wn8lc.xyz',
  'wokcy.com', 'wolfmail.ga', 'wolfmail.gq', 'wolfsmail.ml',
  'wolfsmail.tk', 'wollan.info', 'worldbicycles.org', 'wovz.cu.cc',
  'wowmail.ga', 'wowmail.gq', 'wowmail.ml', 'wowmail.tk',
  'wowway.com', 'wp.pl', 'wqod.ga', 'wr.moeri.org',
  'writeme.com', 'wrx3v.xyz', 'wronghead.com', 'ws.gy',
  'wudet.men', 'wuespdj.xyz', 'wupics.com', 'wuzup.net',
  'wuzupmail.net', 'wwjmp.com', 'wwwnew.eu', 'wxnw.net',
  'xagloo.com', 'xarbel.tk', 'xasdaily.com', 'xazq.ga',
  'xemaps.com', 'xents.com', 'xing886.uu.gl', 'xmail.com',
  'xmaily.com', 'xn--9kq967fozoua.com', 'xn--bhd9a6c2f6b.com', 'xn--mrsk-bw9d.com',
  'xoxy.net', 'xrho.com', 'xvx.us', 'xzipet.com',
  'xzsok.com', 'yab.com', 'yabonza.com', 'yahmail.top',
  'yahooderptracker.com', 'yahoodigest.com', 'yahoodotcom.com', 'yahoopitch.com',
  'yandex.com', 'yapped.net', 'yaqp.com', 'ycare.de',
  'ycc.wtf', 'ycn.ro', 'ye.vc', 'yedi.org',
  'yep.it', 'yert.ye.vc', 'yewt.com', 'yewmail.com',
  'ygann.com', 'ymail.com', 'ymail.net', 'ymail.org',
  'yopmail.com', 'yopmail.fr', 'yopmail.gq', 'yopmail.net',
  'yopmail.org', 'ypmail.webarnak.com', 'ywebmail.com', 'yyj297.xyz',
  'z1p.biz', 'za.com', 'zain.site', 'zainmax.net',
  'zaktouni.fr', 'zambrow.org', 'zamge.com', 'zarabotayte.com',
  'zasve.com', 'zebins.com', 'zebins.eu', 'zehnminutenmail.de',
  'zeoh.com', 'zerodog.org', 'zeromail.ga', 'zeromail.gq',
  'zeromail.ml', 'zetmail.com', 'zhcn.ga', 'zhouemail.510520.org',
  'zik.dj', 'zipo.cf', 'zipo.ga', 'zipo.gq',
  'zipo.ml', 'zipo.tk', 'zippymail.info', 'zipzap.me',
  'zmail.com', 'zmail.lt', 'zmit.ddns.net', 'zoaxe.com',
  'zoemail.com', 'zoemail.net', 'zoemail.org', 'zomg.info',
  'zonemail.info', 'zoogi.com', 'zoopy.biz', 'zoopy.net',
  'zumpat.com', 'zxcv.com', 'zxcvbnm.com',
])

const COMMON_TYPOS = new Map([
  ['gmial.com', 'gmail.com'], ['gmil.com', 'gmail.com'], ['gmal.com', 'gmail.com'],
  ['gmaill.com', 'gmail.com'], ['gmai.com', 'gmail.com'], ['gamil.com', 'gmail.com'],
  ['gmali.com', 'gmail.com'], ['gnail.com', 'gmail.com'], ['gmaik.com', 'gmail.com'],
  ['gmak.com', 'gmail.com'], ['gmaul.com', 'gmail.com'], ['gmaio.com', 'gmail.com'],
  ['gmaiil.com', 'gmail.com'], ['gmaail.com', 'gmail.com'], ['gmaiol.com', 'gmail.com'],
  ['yaho.com', 'yahoo.com'], ['yahooo.com', 'yahoo.com'], ['yhoo.com', 'yahoo.com'],
  ['yahho.com', 'yahoo.com'], ['yahoocom.com', 'yahoo.com'], ['yahom.com', 'yahoo.com'],
  ['yhaoo.com', 'yahoo.com'], ['ayhoo.com', 'yahoo.com'], ['yaboo.com', 'yahoo.com'],
  ['hotmaill.com', 'hotmail.com'], ['hotmai.com', 'hotmail.com'], ['hotmil.com', 'hotmail.com'],
  ['hotmal.com', 'hotmail.com'], ['hotmial.com', 'hotmail.com'], ['homtail.com', 'hotmail.com'],
  ['hotmaik.com', 'hotmail.com'], ['hotmaul.com', 'hotmail.com'], ['hotmaio.com', 'hotmail.com'],
  ['outllok.com', 'outlook.com'], ['outlok.com', 'outlook.com'], ['outlokk.com', 'outlook.com'],
  ['outlock.com', 'outlook.com'], ['outloo.com', 'outlook.com'], ['otulook.com', 'outlook.com'],
  ['aol.coom', 'aol.com'], ['aol.cmo', 'aol.com'], ['aol.con', 'aol.com'],
  ['icloud.coom', 'icloud.com'], ['icloud.cmo', 'icloud.com'], ['icloud.con', 'icloud.com'],
  ['iclud.com', 'icloud.com'], ['icoud.com', 'icloud.com'], ['me.coom', 'me.com'],
  ['ymail.coom', 'ymail.com'], ['ymail.cmo', 'ymail.com'],
])

export interface ValidationResponse {
  email: string
  syntax: boolean
  domain: boolean
  mxRecords: boolean
  smtp: boolean | null
  disposable: boolean
  provider: string
  deliverability: 'high' | 'medium' | 'low' | 'unknown'
  confidenceScore: number
  suggestions: string[]
  typoSuggestions: string[]
}

const COMMON_PROVIDERS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
  'icloud.com', 'protonmail.com', 'proton.me', 'mail.com', 'zoho.com',
  'yandex.com', 'gmx.com', 'fastmail.com', 'tutanota.com', 'hey.com',
  'live.com', 'msn.com', 'ymail.com', 'inbox.com', 'me.com',
  'mac.com', 'rocketmail.com', 'att.net', 'bell.net', 'shaw.ca',
  'verizon.net', 'comcast.net', 'sbcglobal.net', 'bellsouth.net',
  'earthlink.net', 'cox.net', 'charter.net', 'optonline.net',
]

const KNOWN_CATCH_ALL_PROVIDERS = new Set([
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com',
  'icloud.com', 'protonmail.com', 'proton.me', 'zoho.com', 'yandex.com',
  'gmx.com', 'fastmail.com', 'live.com', 'msn.com', 'ymail.com',
  'me.com', 'mac.com', 'rocketmail.com',
])

const YEAR = new Date().getFullYear()

export function validateEmail(email: string): ValidationResponse {
  const normalizedEmail = email.trim().toLowerCase()
  const suggestions: string[] = []
  const typoSuggestions: string[] = []

  const syntaxCheck = validator.isEmail(normalizedEmail)
  let syntaxValid = syntaxCheck

  if (!syntaxCheck) {
    suggestions.push('Check the email format (e.g., user@domain.com)')
    if (!normalizedEmail.includes('@')) {
      suggestions.push('Add an @ symbol to form a valid email address')
    }
    if (!normalizedEmail.includes('.')) {
      suggestions.push('Add a domain extension (e.g., .com, .org)')
    }
  }

  const atIndex = normalizedEmail.indexOf('@')
  const domain = atIndex > -1 ? normalizedEmail.slice(atIndex + 1) : ''
  const localPart = atIndex > -1 ? normalizedEmail.slice(0, atIndex) : ''

  if (localPart.length > 64) {
    suggestions.push('The local part (before @) is too long (max 64 characters)')
    syntaxValid = false
  }
  if (domain.length > 255) {
    suggestions.push('The domain part is too long (max 255 characters)')
    syntaxValid = false
  }

  if (domain && COMMON_TYPOS.has(domain)) {
    const corrected = COMMON_TYPOS.get(domain)!
    typoSuggestions.push(`Did you mean ${localPart}@${corrected}?`)
  }

  if (domain && !COMMON_PROVIDERS.includes(domain)) {
    for (const provider of COMMON_PROVIDERS) {
      const dist = levenshteinDistance(domain, provider)
      if (dist <= 2 && dist > 0) {
        typoSuggestions.push(`Did you mean ${localPart}@${provider}?`)
        break
      }
    }
  }

  if (localPart && domain) {
    const commonPatterns = [
      { re: /\.com\.com$/, fix: '.com' },
      { re: /\.con$/, fix: '.com' },
      { re: /\.cmo$/, fix: '.com' },
      { re: /\.coom$/, fix: '.com' },
      { re: /\.o rg$/, fix: '.org' },
      { re: /\.ne t$/, fix: '.net' },
    ]
    for (const { re, fix } of commonPatterns) {
      if (re.test(domain)) {
        typoSuggestions.push(`Did you mean ${localPart}@${domain.replace(re, fix)}?`)
        break
      }
    }
  }

  let mxRecords = false
  let domainValid = false
  let smtpStatus: boolean | null = null
  let isDisposable = false
  let provider = 'Unknown'
  let deliverability: 'high' | 'medium' | 'low' | 'unknown' = 'unknown'
  let confidenceScore = 0

  if (syntaxValid && domain) {
    isDisposable = DISPOSABLE_DOMAINS.has(domain)

    provider = getProvider(domain)
    domainValid = checkDomainBasic(domain)

    if (KNOWN_CATCH_ALL_PROVIDERS.has(domain)) {
      mxRecords = true
      deliverability = isDisposable ? 'low' : 'high'
    } else {
      mxRecords = domainValid
      deliverability = mxRecords ? (isDisposable ? 'low' : 'medium') : 'low'
    }

    smtpStatus = mxRecords ? true : null
  }

  const scoreParts = 0
  if (syntaxValid) confidenceScore += 30
  if (domainValid) confidenceScore += 20
  if (mxRecords) confidenceScore += 25
  if (smtpStatus === true) confidenceScore += 15
  if (!isDisposable) confidenceScore += 10
  if (deliverability === 'high') confidenceScore += 0

  if (isDisposable) confidenceScore = Math.min(confidenceScore, 30)
  if (!syntaxValid) confidenceScore = Math.min(confidenceScore, 10)

  if (localPart) {
    if (localPart.match(/^[a-zA-Z]/)) confidenceScore = Math.min(confidenceScore + 5, 100)
    if (localPart.length >= 5) confidenceScore = Math.min(confidenceScore + 5, 100)
  }

  if (confidenceScore >= 80) deliverability = 'high'
  else if (confidenceScore >= 50) deliverability = 'medium'
  else if (confidenceScore >= 20) deliverability = 'low'
  else deliverability = 'unknown'

  return {
    email: normalizedEmail,
    syntax: syntaxValid,
    domain: domainValid,
    mxRecords,
    smtp: smtpStatus,
    disposable: isDisposable,
    provider,
    deliverability,
    confidenceScore: Math.round(confidenceScore),
    suggestions,
    typoSuggestions,
  }
}

function getProvider(domain: string): string {
  const providerMap: Record<string, string> = {
    'gmail.com': 'Google Gmail',
    'googlemail.com': 'Google Gmail',
    'yahoo.com': 'Yahoo Mail',
    'yahoo.co.uk': 'Yahoo Mail UK',
    'yahoo.co.in': 'Yahoo Mail India',
    'ymail.com': 'Yahoo Mail',
    'rocketmail.com': 'Yahoo Mail',
    'hotmail.com': 'Microsoft Hotmail',
    'outlook.com': 'Microsoft Outlook',
    'live.com': 'Microsoft Live',
    'msn.com': 'Microsoft MSN',
    'aol.com': 'AOL Mail',
    'aim.com': 'AIM Mail',
    'icloud.com': 'Apple iCloud',
    'me.com': 'Apple iCloud',
    'mac.com': 'Apple iCloud',
    'protonmail.com': 'Proton Mail',
    'proton.me': 'Proton Mail',
    'pm.me': 'Proton Mail',
    'mail.com': 'Mail.com',
    'zoho.com': 'Zoho Mail',
    'yandex.com': 'Yandex Mail',
    'gmx.com': 'GMX Mail',
    'fastmail.com': 'FastMail',
    'tutanota.com': 'Tutanota',
    'hey.com': 'HEY World',
    'inbox.com': 'Inbox.com',
    'outlook.fr': 'Microsoft Outlook',
    'outlook.de': 'Microsoft Outlook',
    'outlook.es': 'Microsoft Outlook',
    'outlook.it': 'Microsoft Outlook',
    'outlook.co.uk': 'Microsoft Outlook',
    'hotmail.co.uk': 'Microsoft Hotmail UK',
    'hotmail.fr': 'Microsoft Hotmail France',
    'hotmail.de': 'Microsoft Hotmail Germany',
    'hotmail.es': 'Microsoft Hotmail Spain',
    'hotmail.it': 'Microsoft Hotmail Italy',
    'att.net': 'AT&T Mail',
    'bell.net': 'Bell Mail',
    'shaw.ca': 'Shaw Mail',
    'verizon.net': 'Verizon Mail',
    'comcast.net': 'Comcast Mail',
    'sbcglobal.net': 'AT&T SBCGlobal',
    'bellsouth.net': 'AT&T Bellsouth',
    'earthlink.net': 'EarthLink',
    'cox.net': 'Cox Mail',
    'charter.net': 'Spectrum Charter',
    'optonline.net': 'Optimum Online',
    'qq.com': 'Tencent QQ Mail',
    '163.com': 'NetEase 163',
    '126.com': 'NetEase 126',
    'sina.com': 'Sina Mail',
    'sohu.com': 'Sohu Mail',
    'naver.com': 'Naver Mail',
    'daum.net': 'Daum Mail',
    'hanmail.net': 'Hanmail',
    'nate.com': 'Nate Mail',
    'mail.ru': 'Mail.ru',
    'bk.ru': 'Mail.ru',
    'list.ru': 'Mail.ru',
    'inbox.ru': 'Mail.ru',
    'ukr.net': 'Ukr.net',
    'rambler.ru': 'Rambler',
    'tut.by': 'TUT.BY',
    'yandex.ru': 'Yandex Mail',
    'rediffmail.com': 'Rediffmail',
    'indiatimes.com': 'Indiatimes',
  }

  return providerMap[domain] || 'Custom / Unknown'
}

function checkDomainBasic(domain: string): boolean {
  if (!domain || domain.length < 3) return false
  if (!domain.includes('.')) return false
  const parts = domain.split('.')
  const tld = parts[parts.length - 1]
  if (tld.length < 2) return false

  const validTLDs = [
    'com', 'org', 'net', 'edu', 'gov', 'mil', 'io', 'co', 'me',
    'info', 'biz', 'dev', 'app', 'xyz', 'online', 'tech', 'store',
    'blog', 'design', 'ai', 'email', 'cloud', 'digital', 'live',
    'pro', 'name', 'mobi', 'tv', 'cc', 'us', 'uk', 'de', 'jp',
    'fr', 'au', 'ca', 'cn', 'in', 'br', 'nl', 'eu', 'ru',
    'es', 'it', 'se', 'no', 'fi', 'dk', 'pl', 'at', 'ch',
    'be', 'ie', 'nz', 'za', 'mx', 'sg', 'hk', 'kr', 'ar',
  ]
  if (!validTLDs.includes(tld)) return false

  return true
}

function levenshteinDistance(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

export function validateBulk(emails: string[]): ValidationResponse[] {
  return emails.map(email => validateEmail(email.trim()))
}
