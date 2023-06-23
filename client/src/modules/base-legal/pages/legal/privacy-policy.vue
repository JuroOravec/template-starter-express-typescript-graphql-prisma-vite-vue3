<template>
  <div class="PrivacyPolicy">
    <h1 class="text-h4 py-8">Privacy Policy</h1>
    <div class="text-body-1 font-weight-bold">
      Last updated
      <span>{{ format(dateLastUpdate, 'do MMM yyyy') }}</span>
    </div>
    <div>
      This privacy notice for
      {{ config.legalCompanyName }}
      (<CEnum :items="['Company', 'we', 'us', 'our']" divider-last=" and " #="{ item }">
        <strong>"{{ item }}"</strong>
      </CEnum>),
      describes how and why we might collect, store, use, and/or share
      (<strong>"process"</strong>)
      your information when you use our services
      (<strong>"Services"</strong>),
      such as when you:

      <ul class="global-list">
        <li>
          Visit our website at <CLink :to="config.sitePublicUrl" />, or any website of ours that
          links to this privacy notice
        </li>
        <li>
          Engage with us in other related ways, including any sales, marketing, or events
        </li>
      </ul>
    </div>

    <div>
      <strong>Questions or concerns?</strong>
      Reading this privacy notice will help you understand your privacy rights and choices.
      If you do not agree with our policies and practices, please do not use our Services.
      If you still have any questions or concerns, please contact us at
      {{ escapeEmail(config.legalEmail) }}.
    </div>

    <h2 class="text-h4">SUMMARY OF KEY POINTS</h2>

    <div>
      <strong>
        This summary provides key points from our privacy notice, but you can find out more
        details about any of these topics by clicking the link following each key point or
        by using our
        <CLink :to="getHashLink({ id: 'toc' })">table of contents</CLink>
        below to find the section you are looking for.
      </strong>
    </div>

    <div>
      <strong>What personal information do we process?</strong>
      When you visit, use, or navigate our Services, we may process personal information
      depending on how you interact with
      {{ config.legalCompanyName }}
      and the Services, the choices you make, and the products and features you use.
      Learn more about
      <CLink :to="getHashLink({ id: 'personalinfo' })">personal information you disclose to us</CLink>.
    </div>

    <div>
      <strong>Do we process any sensitive personal information?</strong>
      We do not process sensitive personal information.
    </div>

    <div>
      <strong>Do we receive any information from third parties?</strong>
      We do not process sensitive personal information.
    </div>

    <div>
      <strong>How do we process your information?</strong>
      We process your information to provide, improve, and administer our Services, communicate
      with you, for security and fraud prevention, and to comply with law. We may also process
      your information for other purposes with your consent. We process your information only
      when we have a valid legal reason to do so. Learn more about
      <CLink :to="tocLinks['2_process']">how we process your information</CLink>.
    </div>

    <div>
      <strong>In what situations and with which parties do we share personal information?</strong>
      We may share information in specific situations and with specific third parties. Learn more
      about
      <CLink :to="tocLinks['4_share']">when and with whom we share your personal information</CLink>.
    </div>

    <div>
      <strong>How do we keep your information safe?</strong>
      We have organizational and technical processes and procedures in place to protect your
      personal information. However, no electronic transmission over the internet or information
      storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee
      that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat
      our security and improperly collect, access, steal, or modify your information. Learn more
      about
      <CLink :to="tocLinks['9_safety']">how we keep your information safe</CLink>.
    </div>

    <div>
      <strong>What are your rights?</strong>
      Depending on where you are located geographically, the applicable privacy law may mean you
      have certain rights regarding your personal information. Learn more about
      <CLink :to="tocLinks['11_rights']">your privacy rights</CLink>.
    </div>

    <div>
      <strong>How do you exercise your rights?</strong>
      The easiest way to exercise your rights is by contacting us. We will consider and act upon
      any request in accordance with applicable data protection laws.
    </div>

    <div>
      Want to learn more about what {{ config.legalCompanyName }} does with any information we collect?
      <CLink :to="getHashLink({ id: 'toc' })">Review the privacy notice in full</CLink>.
    </div>

    <h2 id="toc" class="text-h4">TABLE OF CONTENTS</h2>
    <div>
      <CList type="ol" :items="tocList" #="{ item }">
        <CLink :to="getHashLink(item)">{{ item.title }}</CLink>
      </CList>
    </div>

    <h2 :id="toc['1_collect'].id" class="text-h4">{{ toc['1_collect'].title }}</h2>

    <h3 id="personalinfo" class="text-h6">Personal information you disclose to us</h3>

    <div>
      <em>
        <strong>In short:</strong>
        We collect personal information that you provide to us.
      </em>
    </div>

    <div>
      We collect personal information that you voluntarily provide to us when you register on
      the Services, express an interest in obtaining information about us or our products and
      Services, when you participate in activities on the Services, or otherwise when you
      contact us.
    </div>
    
    <div>
      <strong>Personal Information Provided by You.</strong>
       The personal information that we collect depends on the context of your interactions with
       us and the Services, the choices you make, and the products and features you use.
       The personal information we collect may include the following:

       <CList :items="collectedPII" />
    </div>

    <div>
      <strong>Sensitive Information.</strong>
      We do not process sensitive information.
    </div>

    <div>
      <strong>Payment Data.</strong>
      We may collect data necessary to process your payment if you make purchases, such as your
      payment instrument number, and the security code associated with your payment instrument.
      Payment data is stored by:
      <CList :items="paymentProviders" #="{ item }">
        <CLink :to="item.privacyPolicyUrl">{{ item.name }}</CLink>
      </CList>
    </div>

    <div>
      <strong>Social Media Login Data.</strong>
      We may provide you with the option to register with us using your existing social media
      account details, like your Facebook, Twitter, or other social media account. If you choose
      to register in this way, we will collect the information described in the section called
      <CLink :to="tocLinks['7_social']">{{ toc['7_social'].title }}</CLink>
      below.
    </div>

    <div>
      All personal information that you provide to us must be true, complete, and accurate, and
      you must notify us of any changes to such personal information.
    </div>

    <h3 class="text-h6">Information automatically collected</h3>

    <div>
      <em>
        <strong>In short:</strong>
        Some information — such as your Internet Protocol (IP) address and/or browser and device
        characteristics — is collected automatically when you visit our Services.
      </em>
    </div>

    <div>
      We automatically collect certain information when you visit, use, or navigate the Services. 
      This information does not reveal your specific identity (like your name or contact
      information) but may include device and usage information, such as your IP address, browser
      and device characteristics, operating system, language preferences, referring URLs, device
      name, country, location, information about how and when you use our Services, and other
      technical information. This information is primarily needed to maintain the security and
      operation of our Services, and for our internal analytics and reporting purposes.
    </div>

    <div>
      Like many businesses, we also collect information through cookies and similar technologies.
      You can find out more about this in our Cookie Notice:
      <CLink :to="cookiePolicyUrl" />
    </div>

    <div>
      The information we collect includes:

      <ul class="global-list">
        <li>
          <em>Log and Usage Data.</em>
          Log and usage data is service-related, diagnostic, usage, and performance information our
          servers automatically collect when you access or use our Services and which we record in
          log files. Depending on how you interact with us, this log data may include your
          IP address, device information, browser type, and settings and information about your
          activity in the Services (such as the date/time stamps associated with your usage, pages
          and files viewed, searches, and other actions you take such as which features you use),
          device event information (such as system activity, error reports (sometimes called
          "crash dumps"), and hardware settings).
        </li>
        <li>
          <em>Device Data.</em>
          We collect device data such as information about your computer, phone, tablet, or other
          device you use to access the Services. Depending on the device used, this device data may
          include information such as your IP address (or proxy server), device and application
          identification numbers, location, browser type, hardware model, Internet service provider
          and/or mobile carrier, operating system, and system configuration information.
        </li>
        <li>
          <em>Location Data.</em>
          We collect location data such as information about your device's location, which can be
          either precise or imprecise. How much information we collect depends on the type and
          settings of the device you use to access the Services. For example, we may use GPS and
          other technologies to collect geolocation data that tells us your current location (based
          on your IP address). You can opt out of allowing us to collect this information either by
          refusing access to the information or by disabling your Location setting on your device.
          However, if you choose to opt out, you may not be able to use certain aspects of
          the Services.
        </li>
      </ul>
    </div>

    <h2 :id="toc['2_process'].id" class="text-h4">{{ toc['2_process'].title }}</h2>

    <div>
      <em>
        <strong>In short:</strong>
        We process your information to provide, improve, and administer our Services, communicate
        with you, for security and fraud prevention, and to comply with law. We may also process
        your information for other purposes with your consent.
      </em>
    </div>

    <div>
      <strong>
        We process your personal information for a variety of reasons, depending on how you
        interact with our Services, including:
      </strong>

      <ul class="global-list">
        <li>
          <strong>
            To facilitate account creation and authentication and otherwise manage user accounts.
          </strong>
          We may process your information so you can create and log in to your account, as well as keep your account in working order.
        </li>

        <li>
          <strong>
            To deliver and facilitate delivery of services to the user.
          </strong>
          We may process your information to provide you with the requested service.
        </li>

        <li>
          <strong>
            To respond to user inquiries/offer support to users.
          </strong>
          We may process your information to respond to your inquiries and solve any potential issues you might have with the requested service.
        </li>

        <li>
          <strong>
            To send administrative information to you.
          </strong>
          We may process your information to send you details about our products and services, changes to our terms and policies, and other similar information.
        </li>

        <li>
          <strong>
            To fulfill and manage your orders.
          </strong>
          We may process your information to fulfill and manage your orders, payments, returns, and exchanges made through the Services.
        </li>

        <li>
          <strong>
            To request feedback.
          </strong>
          We may process your information when necessary to request feedback and to contact you about your use of our Services.
        </li>

        <li>
          <strong>
            To send you marketing and promotional communications.
          </strong>
          We may process the personal information you send to us for our marketing purposes, if
          this is in accordance with your marketing preferences. You can opt out of our marketing
          emails at any time. For more information, see
          <CLink :to="tocLinks['11_rights']">{{ toc['11_rights'].title }}</CLink>
          below.
        </li>

        <li>
          <strong>
            To deliver targeted advertising to you.
          </strong>
          We may process your information to develop and display personalized content and
          advertising tailored to your interests, location, and more. For more information see our
          Cookie Notice:
          <CLink :to="cookiePolicyUrl" />
        </li>

        <li>
          <strong>
            To protect our Services.
          </strong>
          We may process your information as part of our efforts to keep our Services safe and secure, including fraud monitoring and prevention.
        </li>

        <li>
          <strong>
            To identify usage trends.
          </strong>
          We may process information about how you use our Services to better understand how they are being used so we can improve them.
        </li>

        <li>
          <strong>
            To determine the effectiveness of our marketing and promotional campaigns.
          </strong>
          We may process your information to better understand how to provide marketing and promotional campaigns that are most relevant to you.
        </li>

        <li>
          <strong>
            To save or protect an individual's vital interest.
          </strong>
          We may process your information when necessary to save or protect an individual’s vital interest, such as to prevent harm.
        </li>
      </ul>
    </div>

    <h2 :id="toc['3_basis'].id" class="text-h4">{{ toc['3_basis'].title }}</h2>

    <div>
      <em>
        <strong>In short:</strong>
        We only process your personal information when we believe it is necessary and we have a valid legal reason (i.e., legal basis) to do so under applicable law, like with your consent, to comply with laws, to provide you with services to enter into or fulfill our contractual obligations, to protect your rights, or to fulfill our legitimate business interests.
      </em>
    </div>

    <div>
      <em>
        <strong>If you are located in the EU or UK, this section applies to you.</strong>
      </em>
    </div>

    <div>
      The General Data Protection Regulation (GDPR) and UK GDPR require us to explain the valid legal bases we rely on in order to process your personal information. As such, we may rely on the following legal bases to process your personal information:

      <ul class="global-list">
        <li>
          <strong>
            Consent.
          </strong>
          We may process your information if you have given us permission (i.e., consent)
          to use your personal information for a specific purpose. You can withdraw your
          consent at any time. Learn more about
          <CLink :to="getHashLink({ id: 'withdrawconsent' })">withdrawing your consent</CLink>.
        </li>

        <li>
          <strong>
            Performance of a Contract.
          </strong>
          We may process your personal information when we believe it is necessary to fulfill our contractual obligations to you, including providing our Services or at your request prior to entering into a contract with you.
        </li>

        <li>
          <strong>
            Legitimate Interests.
          </strong>
          We may process your information when we believe it is reasonably necessary to achieve our legitimate business interests and those interests do not outweigh your interests and fundamental rights and freedoms. For example, we may process your personal information for some of the purposes described in order to:

          <CList :items="[
            'Send users information about special offers and discounts on our products and services',
            'Develop and display personalized and relevant advertising content for our users',
            'Analyze how our Services are used so we can improve them to engage and retain users',
            'Support our marketing activities',
            'Diagnose problems and/or prevent fraudulent activities',
            'Understand how our users use our products and services so we can improve user experience'
          ]" />
        </li>

        <li>
          <strong>
            Legal Obligations.
          </strong>
          We may process your information where we believe it is necessary for compliance with our legal obligations, such as to cooperate with a law enforcement body or regulatory agency, exercise or defend our legal rights, or disclose your information as evidence in litigation in which we are involved.
        </li>

        <li>
          <strong>
            Vital Interests.
          </strong>
          We may process your information where we believe it is necessary to protect your vital interests or the vital interests of a third party, such as situations involving potential threats to the safety of any person.
        </li>
      </ul>
    </div>

    <div>
      <em>
        <strong>If you are located in the EU or UK, this section applies to you.</strong>
      </em>
    </div>

    <div>
      We may process your information if you have given us specific permission (i.e., express
      consent) to use your personal information for a specific purpose, or in situations where your
      permission can be inferred (i.e., implied consent). You can
      <CLink :to="getHashLink({ id: 'withdrawconsent' })">withdraw your consent</CLink>
      at any time.
    </div>

    <div>
      In some exceptional cases, we may be legally permitted under applicable law to process your information without your consent, including, for example:
      
      <CList :items="[
        'If collection is clearly in the interests of an individual and consent cannot be obtained in a timely way',
        'For investigations and fraud detection and prevention',
        'For business transactions provided certain conditions are met',
        'If it is contained in a witness statement and the collection is necessary to assess, process, or settle an insurance claim',
        'For identifying injured, ill, or deceased persons and communicating with next of kin',
        'If we have reasonable grounds to believe an individual has been, is, or may be victim of financial abuse',
        'If it is reasonable to expect collection and use with consent would compromise the availability or the accuracy of the information and the collection is reasonable for purposes related to investigating a breach of an agreement or a contravention of the laws of Canada or a province',
        'If disclosure is required to comply with a subpoena, warrant, court order, or rules of the court relating to the production of records',
        'If it was produced by an individual in the course of their employment, business, or profession and the collection is consistent with the purposes for which the information was produced',
        'If the collection is solely for journalistic, artistic, or literary purposes',
        'If the information is publicly available and is specified by the regulations',
      ]" />
    </div>

    <h2 :id="toc['4_share'].id" class="text-h4">{{ toc['4_share'].title }}</h2>

    <div>
      <em>
        <strong>In short:</strong>
        We may share information in specific situations described in this section and/or with the following third parties.
      </em>
    </div>

    <div>
      We may need to share your personal information in the following situations:

      <ul class="global-list">
        <li>
          <strong>
            Business Transfers.
          </strong>
          We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.
        </li>

        <li>
          <strong>
            When we use Google Maps Platform APIs.
          </strong>
          We may share your information with certain Google Maps Platform APIs
          (e.g., Google Maps API, Places API). We use certain Google Maps Platform APIs
          to retrieve certain information when you make location-specific requests.
          A full list of what we use information for can be found in this section and in
          the previous section titled
          <CLink :to="tocLinks['2_process']">{{ toc['2_process'].title }}</CLink>.
          We obtain and store on your device ("cache") your location. You may revoke your consent
          anytime by contacting us at the contact details provided at the end of this document.
          The Google Maps Platform APIs that we use store and access cookies and other information
          on your devices. If you are a user currently in the European Economic Area (EU countries,
          Iceland, Liechtenstein, and Norway) or the United Kingdom, please take a look at our Cookie
          Notice, which can be found at this link:
          <CLink :to="cookiePolicyUrl" />.
        </li>

        <li>
          <strong>
            Affiliates.
          </strong>
          We may share your information with our affiliates, in which case we will require those affiliates to honor this privacy notice. Affiliates include our parent company and any subsidiaries, joint venture partners, or other companies that we control or that are under common control with us.
        </li>

        <li>
          <strong>
            Business Partners.
          </strong>
          We may share your information with our business partners to offer you certain products, services, or promotions.
        </li>

      </ul>
    </div>

    <h2 :id="toc['5_3pwebsites'].id" class="text-h4">{{ toc['5_3pwebsites'].title }}</h2>

    <div>
      <em>
        <strong>In short:</strong>
        We are not responsible for the safety of any information that you share with third parties that we may link to or who advertise on our Services, but are not affiliated with, our Services.
      </em>
    </div>

    <div>
      The Services may link to third-party websites, online services, or mobile applications and/or contain advertisements from third parties that are not affiliated with us and which may link to other websites, services, or applications. Accordingly, we do not make any guarantee regarding any such third parties, and we will not be liable for any loss or damage caused by the use of such third-party websites, services, or applications. The inclusion of a link towards a third-party website, service, or application does not imply an endorsement by us. We cannot guarantee the safety and privacy of data you provide to any third parties. Any data collected by third parties is not covered by this privacy notice. We are not responsible for the content or privacy and security practices and policies of any third parties, including other websites, services, or applications that may be linked to or from the Services. You should review the policies of such third parties and contact them directly to respond to your questions.
    </div>

    <h2 :id="toc['6_cookies'].id" class="text-h4">{{ toc['6_cookies'].title }}</h2>

    <div>
      <em>
        <strong>In short:</strong>
        We may use cookies and other tracking technologies to collect and store your information.
      </em>
    </div>

    <div>
      We may use cookies and similar tracking technologies (like web beacons and pixels) to access
      or store information. Specific information about how we use such technologies and how you
      can refuse certain cookies is set out in our Cookie Notice:
      <CLink :to="cookiePolicyUrl" />.
    </div>

    <h2 :id="toc['7_social'].id" class="text-h4">{{ toc['7_social'].title }}</h2>

    <div>
      <em>
        <strong>In short:</strong>
        If you choose to register or log in to our Services using a social media account, we may have access to certain information about you.
      </em>
    </div>

    <div>
      Our Services offer you the ability to register and log in using your third-party social media account details (like your Facebook or Twitter logins). Where you choose to do this, we will receive certain profile information about you from your social media provider. The profile information we receive may vary depending on the social media provider concerned, but will often include your name, email address, friends list, and profile picture, as well as other information you choose to make public on such a social media platform.
    </div>

    <div>
      We will use the information we receive only for the purposes that are described in this privacy notice or that are otherwise made clear to you on the relevant Services. Please note that we do not control, and are not responsible for, other uses of your personal information by your third-party social media provider. We recommend that you review their privacy notice to understand how they collect, use, and share your personal information, and how you can set your privacy preferences on their sites and apps.
    </div>

    <h2 :id="toc['8_retain'].id" class="text-h4">{{ toc['8_retain'].title }}</h2>

    <div>
      <em>
        <strong>In short:</strong>
        We keep your information for as long as necessary to fulfill the purposes outlined in this privacy notice unless otherwise required by law.
      </em>
    </div>

    <div>
      We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements). No purpose in this notice will require us keeping your personal information for longer than twelve (12) months past the termination of the user's account.
    </div>

    <div>
      When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize such information, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible.
    </div>

    <h2 :id="toc['9_safety'].id" class="text-h4">{{ toc['9_safety'].title }}</h2>

    <div>
      <em>
        <strong>In short:</strong>
        We aim to protect your personal information through a system of organizational and technical security measures.
      </em>
    </div>

    <div>
      We have implemented appropriate and reasonable technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Although we will do our best to protect your personal information, transmission of personal information to and from our Services is at your own risk. You should only access the Services within a secure environment.
    </div>

    <h2 :id="toc['10_minors'].id" class="text-h4">{{ toc['10_minors'].title }}</h2>
    
    <div>
      <em>
        <strong>In short:</strong>
        We do not knowingly collect data from or market to children under 18 years of age.
      </em>
    </div>

    <div>
      We do not knowingly solicit data from or market to children under 18 years of age. By using
      the Services, you represent that you are at least 18 or that you are the parent or guardian
      of such a minor and consent to such minor dependent’s use of the Services. If we learn that
      personal information from users less than 18 years of age has been collected, we will
      deactivate the account and take reasonable measures to promptly delete such data from our
      records. If you become aware of any data we may have collected from children under age 18,
      please contact us at {{ escapeEmail(config.legalEmail) }}.
    </div>

    <h2 :id="toc['11_rights'].id" class="text-h4">{{ toc['11_rights'].title }}</h2>
    
    <div>
      <em>
        <strong>In short:</strong>
        In some regions, such as the European Economic Area (EEA), United Kingdom (UK), and Canada, you have rights that allow you greater access to and control over your personal information. You may review, change, or terminate your account at any time.
      </em>
    </div>

    <div>
      In some regions (like the EEA, UK, and Canada), you have certain rights under applicable data
      protection laws. These may include the right (i) to request access and obtain a copy of your
      personal information, (ii) to request rectification or erasure; (iii) to restrict
      the processing of your personal information; and (iv) if applicable, to data portability.
      In certain circumstances, you may also have the right to object to the processing of your
      personal information. You can make such a request by contacting us by using the contact
      details provided in the section
      <CLink :to="tocLinks['16_contact']"> {{ toc['16_contact'].title }} </CLink>
      below.
    </div>

    <div>
      We will consider and act upon any request in accordance with applicable data protection laws.
    </div>

    <div>
      If you are located in the EEA or UK and you believe we are unlawfully processing your
      personal information, you also have the right to complain to your
      <CLink to="https://ec.europa.eu/justice/data-protection/bodies/authorities/index_en.htm">
        Member State data protection authority
      </CLink>
      or
      <CLink to="https://ico.org.uk/make-a-complaint/data-protection-complaints/data-protection-complaints/">
        UK data protection authority
      </CLink>.
    </div>

    <div>
      If you are located in Switzerland, you may contact the
      <CLink to="https://www.edoeb.admin.ch/edoeb/en/home.html">
        Federal Data Protection and Information Commissioner
      </CLink>.
    </div>

    <div id="withdrawconsent">
      <strong>Withdrawing your consent:</strong>
      If we are relying on your consent to process your personal information, which may be express
      and/or implied consent depending on the applicable law, you have the right to withdraw your
      consent at any time. You can withdraw your consent at any time by contacting us by using
      the contact details provided in the section
      <CLink :to="tocLinks['16_contact']"> {{ toc['16_contact'].title }} </CLink>
      below or updating your preferences.
    </div>

    <div>
      However, please note that this will not affect the lawfulness of the processing before its withdrawal nor, when applicable law allows, will it affect the processing of your personal information conducted in reliance on lawful processing grounds other than consent.
    </div>

    <div>
      <strong>Opting out of marketing and promotional communications:</strong>
      You can unsubscribe from our marketing and promotional communications at any time by clicking
      on the unsubscribe link in the emails that we send, or by contacting us using the details
      provided in the section
      <CLink :to="tocLinks['16_contact']"> {{ toc['16_contact'].title }} </CLink>
      below. You will then be removed from the marketing lists. However, we may still communicate
      with you — for example, to send you service-related messages that are necessary for
      the administration and use of your account, to respond to service requests, or for other
      non-marketing purposes.
    </div>

    <h3 class="text-h6">Account Information</h3>

    <div>
      If you would at any time like to review or change the information in your account or terminate your account, you can:

      <CList :items="[
        'Contact us using the contact information provided.',
        'Log in to your account settings and update your user account.',
      ]"/>
    </div>

    <div>
      Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases. However, we may retain some information in our files to prevent fraud, troubleshoot problems, assist with any investigations, enforce our legal terms and/or comply with applicable legal requirements.
    </div>

    <div>
      <strong>Cookies and similar technologies:</strong>
      Most Web browsers are set to accept cookies by default. If you prefer, you can usually
      choose to set your browser to remove cookies and to reject cookies. If you choose to remove
      cookies or reject cookies, this could affect certain features or services of our Services.
      You may also
      <CLink to="http://www.aboutads.info/choices/">
        opt out of interest-based advertising by advertisers
      </CLink>
      on our Services. For further information, please see our Cookie Notice:
      <CLink :to="cookiePolicyUrl" />.
    </div>

    <div>
      If you have questions or comments about your privacy rights, you may email us at
      {{ escapeEmail(config.legalEmail) }}.
    </div>

    <h2 :id="toc['12_dnt'].id" class="text-h4">{{ toc['12_dnt'].title }}</h2>

    <div>
      Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track ("DNT") feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. At this stage no uniform technology standard for recognizing and implementing DNT signals has been finalized. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online. If a standard for online tracking is adopted that we must follow in the future, we will inform you about that practice in a revised version of this privacy notice.
    </div>

    <h2 :id="toc['13_usca'].id" class="text-h4">{{ toc['13_usca'].title }}</h2>

    <div>
      <em>
        <strong>In short:</strong>
        Yes, if you are a resident of California, you are granted specific rights regarding access to your personal information.
      </em>
    </div>

    <div>
      California Civil Code Section 1798.83, also known as the "Shine The Light" law, permits our users who are California residents to request and obtain from us, once a year and free of charge, information about categories of personal information (if any) we disclosed to third parties for direct marketing purposes and the names and addresses of all third parties with which we shared personal information in the immediately preceding calendar year. If you are a California resident and would like to make such a request, please submit your request in writing to us using the contact information provided below.
    </div>

    <div>
      If you are under 18 years of age, reside in California, and have a registered account with Services, you have the right to request removal of unwanted data that you publicly post on the Services. To request removal of such data, please contact us using the contact information provided below and include the email address associated with your account and a statement that you reside in California. We will make sure the data is not publicly displayed on the Services, but please be aware that the data may not be completely or comprehensively removed from all our systems (e.g., backups, etc.).
    </div>

    <h3 class="text-h6">CCPA Privacy Notice</h3>

    <div>
      The California Code of Regulations defines a "resident" as:

      <CList :items="[
        '(1) every individual who is in the State of California for other than a temporary or transitory purpose and',
        '(2) every individual who is domiciled in the State of California who is outside the State of California for a temporary or transitory purpose'
      ]" />
    </div>

    <div>
      All other individuals are defined as "non-residents."
    </div>

    <div>
      If this definition of "resident" applies to you, we must adhere to certain rights and obligations regarding your personal information.
    </div>

    <div>
      <strong>
        What categories of personal information do we collect?
      </strong>
    </div>

    <div>
      We have collected the following categories of personal information in the past twelve (12) months:
    </div>

    <div>
      <v-table density="compact">
        <thead>
          <tr>
            <td>Category</td>
            <td>Examples</td>
            <td>Collected</td>
            <td>Retain policy</td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in ccpaCollectedPII" :key="item.category">
            <td>{{ item.category }}</td>
            <td>{{ item.examples }}</td>
            <td>{{ item.collected ? 'YES' : 'NO' }}</td>
            <td>{{ item.retainPolicy }}</td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <div>
      We may also collect other personal information outside of these categories through instances where you interact with us in person, online, or by phone or mail in the context of:

      <CList :items="[
        'Receiving help through our customer support channels;',
        'Participation in customer surveys or contests; and',
        'Facilitation in the delivery of our Services and to respond to your inquiries.'
      ]"
      />
    </div>

    <div>
      <strong>
        How do we use and share your personal information?
      </strong>
    </div>

    <div>
      More information about our data collection and sharing practices can be found in this
      privacy notice and our Cookie Notice:
      <CLink :to="cookiePolicyUrl" />.
    </div>

    <div>
      You may contact us by email at
      {{ escapeEmail(config.legalEmail) }},
      or by referring to the contact details at the bottom of this document.
    </div>

    <div>
      If you are using an authorized agent to exercise your right to opt out we may deny a request if the authorized agent does not submit proof that they have been validly authorized to act on your behalf.
    </div>

    <div>
      <strong>
        Will your information be shared with anyone else?
      </strong>
    </div>

    <div>
      We may disclose your personal information with our service providers pursuant to a written contract between us and each service provider. Each service provider is a for-profit entity that processes the information on our behalf, following the same strict privacy protection obligations mandated by the CCPA.
    </div>

    <div>
      We may use your personal information for our own business purposes, such as for undertaking internal research for technological development and demonstration. This is not considered to be "selling" of your personal information.
    </div>

    <div>
      {{ config.legalCompanyName }} has not disclosed, sold, or shared any personal information
      to third parties for a business or commercial purpose in the preceding twelve (12) months.
      {{  config.legalCompanyName }} will not sell or share personal information in the future
      belonging to website visitors, users, and other consumers.
    </div>

    <div>
      <strong>
        Your rights with respect to your personal data
      </strong>
    </div>

    <div>
      <ul class="global-list">
        <li>
          <strong>Right to request deletion of the data — Request to delete:</strong>
          You can ask for the deletion of your personal information. If you ask us to delete your
          personal information, we will respect your request and delete your personal information,
          subject to certain exceptions provided by law, such as (but not limited to) the exercise
          by another consumer of his or her right to free speech, our compliance requirements
          resulting from a legal obligation, or any processing that may be required to protect
          against illegal activities.
        </li>

        <li>
          <strong>Right to be informed — Request to know:</strong>
          Depending on the circumstances, you have a right to know:

          <CList :items="[
            'whether we collect and use your personal information;',
            'the categories of personal information that we collect;',
            'the purposes for which the collected personal information is used;',
            'whether we sell or share personal information to third parties;',
            'the categories of personal information that we sold, shared, or disclosed for a business purpose;',
            'the categories of third parties to whom the personal information was sold, shared, or disclosed for a business purpose;',
            'the business or commercial purpose for collecting, selling, or sharing personal information; and',
            'the specific pieces of personal information we collected about you.',
          ]"/>

          In accordance with applicable law, we are not obligated to provide or delete consumer information that is de-identified in response to a consumer request or to re-identify individual data to verify a consumer request.
        </li>

        <li>
          <strong>Right to Non-Discrimination for the Exercise of a Consumer’s Privacy Rights:</strong>
          We will not discriminate against you if you exercise your privacy rights.
        </li>        

        <li>
          <strong>Right to Limit Use and Disclosure of Sensitive Personal Information:</strong>
          We do not process consumer's sensitive personal information.
        </li>        

        <li>
          <strong>Verification process:</strong>
          <div>
            Upon receiving your request, we will need to verify your identity to determine you are the same person about whom we have the information in our system. These verification efforts require us to ask you to provide information so that we can match it with information you have previously provided us. For instance, depending on the type of request you submit, we may ask you to provide certain information so that we can match the information you provide with the information we already have on file, or we may contact you through a communication method (e.g., phone or email) that you have previously provided to us. We may also use other verification methods as the circumstances dictate.
          </div>
          <div>
            We will only use personal information provided in your request to verify your identity or authority to make the request. To the extent possible, we will avoid requesting additional information from you for the purposes of verification. However, if we cannot verify your identity from the information already maintained by us, we may request that you provide additional information for the purposes of verifying your identity and for security or fraud-prevention purposes. We will delete such additionally provided information as soon as we finish verifying you.
          </div>
        </li>        

        <li>
          <strong>Other privacy rights:</strong>
          <CList :items="[
            'You may object to the processing of your personal information.',
            'You may request correction of your personal data if it is incorrect or no longer relevant, or ask to restrict the processing of the information.',
            'You can designate an authorized agent to make a request under the CCPA on your behalf. We may deny a request from an authorized agent that does not submit proof that they have been validly authorized to act on your behalf in accordance with the CCPA.',
            'You may request to opt out from future selling or sharing of your personal information to third parties. Upon receiving an opt-out request, we will act upon the request as soon as feasibly possible, but no later than fifteen (15) days from the date of the request submission.',
          ]" />
        </li>    
      </ul>
    </div>

    <div>
      To exercise these rights, you can contact us by email at
      {{ escapeEmail(config.legalEmail) }},
      or by referring to the contact details at the bottom of this document. If you have
      a complaint about how we handle your data, we would like to hear from you.
    </div>

    <h2 :id="toc['14_usva'].id" class="text-h4">{{ toc['14_usva'].title }}</h2>

    <div>
      <em>
        <strong>In short:</strong>
        Yes, if you are a resident of Virginia, you may be granted specific rights regarding access to and use of your personal information.
      </em>
    </div>

    <h3 class="text-h6">Virginia CDPA Privacy Notice</h3>

    <div>
      Under the Virginia Consumer Data Protection Act (CDPA):
    </div>

    <div>
      "Consumer" means a natural person who is a resident of the Commonwealth acting only in an individual or household context. It does not include a natural person acting in a commercial or employment context.
    </div>

    <div>
      "Personal data" means any information that is linked or reasonably linkable to an identified or identifiable natural person. "Personal data" does not include de-identified data or publicly available information.
    </div>

    <div>
      "Sale of personal data" means the exchange of personal data for monetary consideration.
    </div>

    <div>
      If this definition "consumer" applies to you, we must adhere to certain rights and obligations regarding your personal data.
    </div>

    <div>
      The information we collect, use, and disclose about you will vary depending on how you
      interact with {{ config.legalCompanyName }} and our Services. To find out more, please visit the following
      links:

      <ul class="global-list">
        <li>
          <CLink :to="tocLinks['1_collect']">{{ toc['1_collect'].title }}</CLink>
        </li>
        <li>
          <CLink :to="tocLinks['2_process']">{{ toc['2_process'].title }}</CLink>
        </li>
        <li>
          <CLink :to="tocLinks['4_share']">{{ toc['4_share'].title }}</CLink>
        </li>
      </ul>
    </div>

    <div>
      <strong>Your rights with respect to your personal data: </strong>
      <CList :items="[
        'Right to be informed whether or not we are processing your personal data',
        'Right to access your personal data',
        'Right to correct inaccuracies in your personal data',
        'Right to request deletion of your personal data',
        'Right to obtain a copy of the personal data you previously shared with us',
        'Right to opt out of the processing of your personal data if it is used for targeted advertising, the sale of personal data, or profiling in furtherance of decisions that produce legal or similarly significant effects (\'profiling\')',
      ]" />
    </div>

    <div>
      {{ config.legalCompanyName }} sells personal data to third parties or processes personal data for targeted advertising. Please see the following section to find out how you can opt out from further selling or sharing of your personal data for targeted advertising or profiling purposes.
    </div>

    <div>
      <strong>Exercise your rights provided under the Virginia CDPA</strong>
    </div> 

    <div>
      More information about our data collection and sharing practices can be found in this
      privacy notice and our Cookie Notice:
      <CLink :to="cookiePolicyUrl" />.
    </div> 

    <div>
      You can opt out from the selling of your personal data, targeted advertising, or profiling
      by disabling cookies in Cookie Preference Settings. You may contact us by email at
      {{ escapeEmail(config.legalEmail) }},
      or by referring to the contact details at the bottom of this document.
    </div> 

    <div>
      If you are using an authorized agent to exercise your rights, we may deny a request if the authorized agent does not submit proof that they have been validly authorized to act on your behalf.
    </div> 

    <div>
      <strong>Verification process</strong>
    </div>

    <div>
      We may request that you provide additional information reasonably necessary to verify you and your consumer's request. If you submit the request through an authorized agent, we may need to collect additional information to verify your identity before processing your request.
    </div> 

    <div>
      Upon receiving your request, we will respond without undue delay, but in all cases, within forty-five (45) days of receipt. The response period may be extended once by forty-five (45) additional days when reasonably necessary. We will inform you of any such extension within the initial 45-day response period, together with the reason for the extension.
    </div> 

    <div>
      <strong>Verification process</strong>
    </div>

    <div>
      If we decline to take action regarding your request, we will inform you of our decision
      and reasoning behind it. If you wish to appeal our decision, please email us at
      {{ escapeEmail(config.legalEmail) }}.
      Within sixty (60) days of receipt of an appeal, we will inform you in writing of any action
      taken or not taken in response to the appeal, including a written explanation of the reasons
      for the decisions. If your appeal if denied, you may contact the Attorney General to submit
      a complaint.
    </div> 

    <h2 :id="toc['15_updates'].id" class="text-h4">{{ toc['15_updates'].title }}</h2>

    <div>
      <em>
        <strong>In short:</strong>
        Yes, we will update this notice as necessary to stay compliant with relevant laws.
      </em>
    </div>

    <div>
      We may update this privacy notice from time to time. The updated version will be indicated by an updated "Revised" date and the updated version will be effective as soon as it is accessible. If we make material changes to this privacy notice, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you to review this privacy notice frequently to be informed of how we are protecting your information.
    </div> 

    <h2 :id="toc['16_contact'].id" class="text-h4">{{ toc['16_contact'].title }}</h2>

    <div>
      If you have questions or comments about this notice, you may contact our Data Protection
      Officer (DPO),
      {{ config.legalDpoContactName }},
      by email at
      {{ escapeEmail(config.legalEmail) }},
      or contact us by post at:
      <br/>
      <br/>
      <CEnum :items="config.legalAddress">
        <template #divider>,<br/></template>
      </CEnum>
    </div> 

    <h2 :id="toc['17_request'].id" class="text-h4">{{ toc['17_request'].title }}</h2>

    <div>
      Based on the applicable laws of your country, you may have the right to request access
      to the personal information we collect from you, change that information, or delete it.
      To request to review, update, or delete your personal information, you may contact us by
      email at
      {{ escapeEmail(config.legalEmail) }},
      or by referring to the contact details at the bottom of this document.
    </div>



    <!-- <div>
      This privacy policy was created using Termly's
      <CLink to="https://termly.io/products/privacy-policy-generator/">
        Cookie Consent Manager </CLink
      >.
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns';
import mapValues from 'lodash/mapValues';

import { config } from '@/../globals/config';
import { legalRoutes } from '../../router';

definePageMeta(legalRoutes['privacy-policy']);

const cookiePolicyUrl = legalRoutes['cookie-policy'].path;
const dateLastUpdate = new Date('2023-06-17');

const toc = {
  '1_collect': { title: '1. WHAT INFORMATION DO WE COLLECT?', id: 'infocollect' },
  '2_process': { title: '2. HOW DO WE PROCESS YOUR INFORMATION?', id: 'infouse' },
  '3_basis': { title: '3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR PERSONAL INFORMATION?', id: 'legalbases' },
  '4_share': { title: '4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?', id: 'whoshare' },
  '5_3pwebsites': { title: '5. WHAT IS OUR STANCE ON THIRD-PARTY WEBSITES?', id: '3pwebsites' },
  '6_cookies': { title: '6. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?', id: 'cookies' },
  '7_social': { title: '7. HOW DO WE HANDLE YOUR SOCIAL LOGINS?', id: 'sociallogins' },
  '8_retain': { title: '8. HOW LONG DO WE KEEP YOUR INFORMATION?', id: 'inforetain' },
  '9_safety': { title: '9. HOW DO WE KEEP YOUR INFORMATION SAFE?', id: 'infosafe' },
  '10_minors': { title: '10. DO WE COLLECT INFORMATION FROM MINORS?', id: 'infominors' },
  '11_rights': { title: '11. WHAT ARE YOUR PRIVACY RIGHTS?', id: 'privacyrights' },
  '12_dnt': { title: '12. CONTROLS FOR DO-NOT-TRACK FEATURES', id: 'DNT' },
  '13_usca': { title: '13. DO CALIFORNIA RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?', id: 'caresidents' },
  '14_usva': { title: '14. DO VIRGINIA RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?', id: 'virginia' },
  '15_updates': { title: '15. DO WE MAKE UPDATES TO THIS NOTICE?', id: 'policyupdates' },
  '16_contact': { title: '16. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?', id: 'contact' },
  '17_request': { title: '17. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?', id: 'request' },
} satisfies Record<string, { title: string; id: string }>;
const getHashLink = (item: { id: string }) => {
  return { hash: `#${item.id}` };
};
const tocLinks = mapValues(toc, (item) => getHashLink(item));
const tocList = Object.values(toc);

const collectedPII = ['names', 'phone numbers', 'email addresses', 'mailing addresses', 'job titles', 'usernames', 'passwords', 'contact preferences', 'contact or authentication data'];
const ccpaCollectedPII = [
  {
    category: 'A. Identifiers',
    examples: 'Contact details, such as real name, alias, postal address, telephone or mobile contact number, unique personal identifier, online identifier, Internet Protocol address, email address, and account name',
    collected: true,
    retainPolicy: 'As long as the user has an account with us',
  },
  {
    category: 'B. Personal information categories listed in the California Customer Records statute',
    examples: 'Name, contact information, education, employment, employment history, and financial information',
    collected: true,
    retainPolicy: 'As long as the user has an account with us',
  },
  {
    category: 'C. Protected classification characteristics under California or federal law',
    examples: 'Gender and date of birth',
    collected: true,
    retainPolicy: 'As long as the user has an account with us',
  },
  {
    category: 'D. Commercial information',
    examples: 'Transaction information, purchase history, financial details, and payment information',
    collected: true,
    retainPolicy: 'As long as the user has an account with us',
  },
  {
    category: 'E. Biometric information',
    examples: 'Fingerprints and voiceprints',
    collected: true,
    retainPolicy: 'As long as the user has an account with us',
  },
  {
    category: 'F. Internet or other similar network activity',
    examples: 'Browsing history, search history, online behavior, interest data, and interactions with our and other websites, applications, systems, and advertisements',
    collected: true,
    retainPolicy: 'As long as the user has an account with us',
  },
  {
    category: 'H. Audio, electronic, visual, thermal, olfactory, or similar information',
    examples: 'Images and audio, video or call recordings created in connection with our business activities',
    collected: true,
    retainPolicy: 'As long as the user has an account with us',
  },
  {
    category: 'I. Professional or employment-related information',
    examples: 'Business contact details in order to provide you our Services at a business level or job title, work history, and professional qualifications if you apply for a job with us',
    collected: true,
    retainPolicy: 'As long as the user has an account with us',
  },
  {
    category: 'J. Education Information',
    examples: 'Student records and directory information',
    collected: true,
    retainPolicy: 'As long as the user has an account with us',
  },
  {
    category: 'K. Inferences drawn from other personal information',
    examples: 'Inferences drawn from any of the collected personal information listed above to create a profile or summary about, for example, an individual’s preferences and characteristics',
    collected: true,
    retainPolicy: 'As long as the user has an account with us',
  },
  {
    category: 'L. Sensitive Personal Information',
    examples: '',
    collected: false,
    retainPolicy: 'As long as the user has an account with us',
  },
] satisfies { category: string; examples: string; collected: boolean; retainPolicy: string; }[];

const paymentProviders = [
  { name: 'Paddle', privacyPolicyUrl: 'https://www.paddle.com/legal/privacy' },
] satisfies { name: string; privacyPolicyUrl: string; }[];
</script>

<style lang="scss">
.PrivacyPolicy {
  display: flex;
  flex-direction: column;
  gap: 16px;

  h3, h2 {
    padding-top: 24px;
    font-weight: bold;
  }

  li {
    padding: 8px 0;
  }
}
</style>
