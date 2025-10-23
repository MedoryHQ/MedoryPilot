import ReactDOM from "react-dom";

if (typeof window !== "undefined") {
  try {
    const rdom = ReactDOM as unknown as {
      findDOMNode?: (c: any) => Element | null;
    };

    if (!rdom.findDOMNode) {
      rdom.findDOMNode = (component: any) => {
        if (!component) return null;
        if (component instanceof Element) return component;
        try {
          if (typeof component.getEditor === "function") {
            const ed = component.getEditor();
            if (ed?.root instanceof Element) return ed.root;
          }
          if (component?.editor?.root instanceof Element)
            return component.editor.root;
          if (component?.editor?.container instanceof Element)
            return component.editor.container;
        } catch {
          //
        }
        return null;
      };
    }
  } catch {
    //
  }
}
