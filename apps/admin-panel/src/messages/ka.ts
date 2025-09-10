export const ka = {
  translation: {
    global: {
      name: "Medory",
      description:
        "ეხმარება ექიმებს დროის დაზოგვაში და მეტი ჯავშნის დამუშავებაში, ხოლო პაციენტები წუთებში ჯავშნიან, უკავშირდებიან და იხდის.",
      platform: "Healthcare პლატფორმა",

      doctor: "თამარ ჩადუნელი",
      adminPannel: "Medory ადმინ პანელი",
      search: "ძიება...",
      close: "დახურვა",
      preferences: "პრეფერენციები",
      language: "ენა"
    },
    pages: {
      dashboard: "Dashboard"
    },
    auth: {
      welcome: "გამარობა",
      login: "შედით თქვენს ანგარიშში",
      enterOtp: "შეიყვანეთ ოთხნიშნა კოდი",
      loginForm: {
        email: "ელ-ფოსტა",
        password: "პაროლი",
        remember: "დამახსოვრება",
        login: "შესვლა"
      },
      otpForm: {
        verify: "ვერიფიკაცია",
        resendAvialible: "გაგზავნას შეძლებთ: ",
        resend: "კოდით გაგზავნა",
        inMin: "წუთში",
        verificationCode: "ვერიფიკაციის კოდი"
      },
      errors: {
        emailRequired: "ელ-ფოსტა აუცილებელია",
        invalidEmail: "არასწორი ელ-ფოსტა",
        passwordRequired: "პაროლი აუცილებელია",
        passwordLength: "პაროლი უნდა იყოს 8-დან 100 სიმბოლომდე სიგრძის",
        otpRequired: "OTP კოდი უნდა შედგებოდეს 4 ციფრისგან",
        invalidOTP: "არასწორი OTP კოდი, გთხოვთ სცადეთ თავიდან"
      }
    },
    menu: {
      dashboard: "დაფა",
      patients: "პაციენტები",
      appointments: "შეხვედრები",
      examinations: "გამოკვლევები",
      all: "გამოკვლევები",
      visits: "ვიზიტები",
      documents: "დოკუმენტები",
      messages: "შეტყობინებები",
      website: "ვებ საიტი",
      home: "მთავარი",
      services: "სერვისები",
      menu: "მენიუ",
      news: "სიახლეები",
      blogs: "ბლოგები",
      analytics: "ანალიტიკა",
      notFound: "ვერ მოიძებნა",
      search: "ძიება",
      settings: "პარამეტრები",
      general: "ზოგადი",
      profile: "პროფილი",
      helpAndSupport: "დახმარება",
      "help-and-support": "დახმარება",
      landing: "ლენდინგი",
      security: "უსაფრთხოება"
    },
    sidebar: {
      doctor: "DR",
      administrator: "ადმინისტრატორი",
      profile: "პროფილი",
      settings: "პარამეტრები",
      helpAndSupport: "დახმარება",
      logout: "გამოსვლა"
    },
    theme: {
      switchToDark: "მუქ რეჟიმზე გადართვა",
      switchToLight: "ნათელ რეჟიმზე გადართვა",
      darkMode: "მუქი რეჟიმი",
      lightMode: "ნათელი რეჟიმი"
    },
    search: {
      results: "ძიების შედეგები",
      noResults: "შედეგი ვერ მოიძებნა",
      seeAllResults: "ყველა შედეგის ნახვა"
    },

    toast: {
      addedTitle: "{{item}} დამატებულია წარმატებით",
      addedDescription: "{{item}} დაემატა სისტემაში.",
      updatedTitle: "{{item}} განახლდა",
      updatedDescription: "{{item}} განახლდა წარმატებით.",
      deletedTitle: "{{item}} წაიშალა",
      deletedDescription: "{{item}} წაიშალა სისტემიდან.",
      savedTitle: "{{item}} შენახულია",
      savedDescription: "თქვენი ცვლილებები წარმატებით შეინახა.",
      failedTitle: "{{action}} ვერ შესრულდა",
      failedDescription: "მოხდა შეცდომა ამ მოქმედების შესრულებისას.",

      success: "წარმატება",
      error: "შეცდომა",
      warning: "გაფრთხილება",
      info: "ინფორმაცია",

      added: "წარმატებით დაემატა",
      updated: "წარმატებით განახლდა",
      deleted: "წარმატებით წაიშალა",
      saved: "წარმატებით შეინახა",
      failed: "ოპერაცია ვერ შესრულდა",
      loading: "იტვირთება",

      patientAdded: "პაციენტი წარმატებით დაემატა",
      patientUpdated: "პაციენტი წარმატებით განახლდა",
      patientDeleted: "პაციენტი წარმატებით წაიშალა",

      bookingAdded: "ჯავშანი წარმატებით შეიქმნა",
      bookingUpdated: "ჯავშანი წარმატებით განახლდა",
      bookingDeleted: "ჯავშანი წარმატებით გაუქმდა",
      bookingConfirmed: "ჯავშანი დადასტურდა",
      bookingCancelled: "ჯავშანი გაუქმდა",

      settingsSaved: "პარამეტრები წარმატებით შეინახა",
      dataSynced: "მონაცემები წარმატებით სინქრონიზირდა",
      exportSuccess: "მონაცემები წარმატებით გაიტანა",
      importSuccess: "მონაცემები წარმატებით შემოიტანა",

      operation: {
        successful: "ოპერაცია წარმატებით დასრულდა",
        failed: "ოპერაცია ვერ შესრულდა. გთხოვთ სცადოთ ხელახლა."
      },

      validationError:
        "გთხოვთ გადაამოწმოთ თქვენი შეყვანილი მონაცემები და სცადოთ ხელახლა.",
      networkError: "ქსელის შეცდომა. გთხოვთ გადაამოწმოთ კავშირი.",
      permissionDenied: "წვდომა უარყოფილია. გთხოვთ დაუკავშირდეთ ადმინისტრატორს."
    }
  }
};
