import { RESOLVER } from "@/adl-gen/resolver";
import { getEndpoints } from "./api-cap-get-eps";

import * as CAP from "@/adl-gen/protoapp/apis/captest";

import { expect, test } from 'vitest';
import { CapToken, Endpoint, FollowupAbleApi } from "./api-types";

test('empty capTokens', () => {
  const capTokens: CapToken<unknown>[] = [];
  const endpoints = getEndpoints(RESOLVER, CAP.texprApiRequests(), capTokens);
  expect(endpoints.length).toBe(2)
  expect(endpoints.filter(ep => ep.kind === "api").length).toBe(1)
})




test('an A_API capTokens', () => {
  const capTokens: CapToken<unknown>[] = [
    {
      type: CAP.texprA_ApiToken().value,
      apis_called: [],
      token_value: "111"
    }
  ];
  const endpoints = getEndpoints(RESOLVER, CAP.texprApiRequests(), capTokens);
  expect(endpoints.filter(ep => ep.kind === "api").length).toBe(2)
  const a_api = endpoints.filter(ep => ep.kind === "api")[0]
  expect(a_api.name).toBe("accessTokenApi")
  expect(a_api.token_value).toBe("111")
  expect(a_api.apis_called).toStrictEqual([])
  expect(a_api.endpoints.length).toBe(2)
})

test('A_API->B_API capTokens', () => {
  const capTokens: CapToken<unknown>[] = [
    {
      type: CAP.texprA_ApiToken().value,
      apis_called: [],
      token_value: "111"
    },
    {
      type: CAP.texprB_ApiToken().value,
      apis_called: [
        {
          token_type: CAP.texprA_ApiToken(),
          value: "111"
        }
      ],
      token_value: "222"
    },
  ];
  const endpoints = getEndpoints(RESOLVER, CAP.texprApiRequests(), capTokens);
  expect(endpoints.filter(ep => ep.kind === "api").length).toBe(2)
  const a_api = endpoints.filter(ep => ep.kind === "api")[0]
  expect(a_api.name).toBe("accessTokenApi")
  expect(a_api.token_value).toBe("111")
  expect(a_api.apis_called).toStrictEqual([])
  expect(a_api.endpoints.length).toBe(3)
  const b_api = a_api.endpoints.filter(ep => ep.kind === "api")[0]
  expect(b_api.token_value).toBe("222")
  expect(b_api.apis_called.length).toBe(1)
  expect(b_api.apis_called[0].value).toBe("111")
  expect(b_api.endpoints.length).toBe(1)
})

test('A_API->(B_API,B_API) capTokens', () => {
  const capTokens: CapToken<unknown>[] = [
    {
      type: CAP.texprA_ApiToken().value,
      apis_called: [],
      token_value: "111"
    },
    {
      type: CAP.texprB_ApiToken().value,
      apis_called: [
        {
          token_type: CAP.texprA_ApiToken(),
          value: "111"
        }
      ],
      token_value: "222"
    },
    {
      type: CAP.texprB_ApiToken().value,
      apis_called: [
        {
          token_type: CAP.texprA_ApiToken(),
          value: "111"
        }
      ],
      token_value: "333"
    },
  ];
  const endpoints = getEndpoints(RESOLVER, CAP.texprApiRequests(), capTokens);
  expect(endpoints.filter(ep => ep.kind === "api").length).toBe(2)
  const a_api = endpoints.filter(ep => ep.kind === "api")[0]
  expect(a_api.name).toBe("accessTokenApi")
  expect(a_api.token_value).toBe("111")
  expect(a_api.apis_called).toStrictEqual([])
  expect(a_api.endpoints.length).toBe(4)
  {
    const b_api = a_api.endpoints.filter(ep => ep.kind === "api")[0]
    expect(b_api.token_value).toBe("222")
    expect(b_api.apis_called.length).toBe(1)
    expect(b_api.apis_called[0].value).toBe("111")
    expect(b_api.endpoints.length).toBe(1)
  }
  {
    const b_api = a_api.endpoints.filter(ep => ep.kind === "api")[1]
    expect(b_api.token_value).toBe("333")
    expect(b_api.apis_called.length).toBe(1)
    expect(b_api.apis_called[0].value).toBe("111")
    expect(b_api.endpoints.length).toBe(1)
  }
})


test('A_API,A_API->(B_API,B_API) capTokens', () => {
  const capTokens: CapToken<unknown>[] = [
    {
      type: CAP.texprA_ApiToken().value,
      apis_called: [],
      token_value: "000"
    },
    {
      type: CAP.texprA_ApiToken().value,
      apis_called: [],
      token_value: "111"
    },
    {
      type: CAP.texprB_ApiToken().value,
      apis_called: [
        {
          token_type: CAP.texprA_ApiToken(),
          value: "111"
        }
      ],
      token_value: "222"
    },
    {
      type: CAP.texprB_ApiToken().value,
      apis_called: [
        {
          token_type: CAP.texprA_ApiToken(),
          value: "111"
        }
      ],
      token_value: "333"
    },
  ];
  const endpoints = getEndpoints(RESOLVER, CAP.texprApiRequests(), capTokens);
  expect(endpoints.filter(ep => ep.kind === "api").length).toBe(3)
  {
    const a_api = endpoints.filter(ep => ep.kind === "api")[0]
    expect(a_api.token_value).toBe("000")
    expect(a_api.apis_called).toStrictEqual([])
    expect(a_api.endpoints.length).toBe(2)
  }
  {
    const a_api = endpoints.filter(ep => ep.kind === "api")[1]
    expect(a_api.token_value).toBe("111")
    expect(a_api.apis_called).toStrictEqual([])
    expect(a_api.endpoints.length).toBe(4)
    {
      const b_api = a_api.endpoints.filter(ep => ep.kind === "api")[0]
      expect(b_api.token_value).toBe("222")
      expect(b_api.apis_called.length).toBe(1)
      expect(b_api.apis_called[0].value).toBe("111")
      expect(b_api.endpoints.length).toBe(1)
    }
    {
      const b_api = a_api.endpoints.filter(ep => ep.kind === "api")[1]
      expect(b_api.token_value).toBe("333")
      expect(b_api.apis_called.length).toBe(1)
      expect(b_api.apis_called[0].value).toBe("111")
      expect(b_api.endpoints.length).toBe(1)
    }
  }
})

test('A_API->B_API,A_API->(B_API->C_API,B_API) capTokens', () => {
  const capTokens: CapToken<unknown>[] = [
    {
      type: CAP.texprA_ApiToken().value,
      apis_called: [],
      token_value: "000"
    },
    {
      type: CAP.texprA_ApiToken().value,
      apis_called: [],
      token_value: "111"
    },
    {
      type: CAP.texprB_ApiToken().value,
      apis_called: [
        {
          token_type: CAP.texprA_ApiToken(),
          value: "111"
        }
      ],
      token_value: "222"
    },
    {
      type: CAP.texprB_ApiToken().value,
      apis_called: [
        {
          token_type: CAP.texprA_ApiToken(),
          value: "111"
        }
      ],
      token_value: "333"
    },
    {
      type: CAP.texprC_ApiToken().value,
      apis_called: [
        {
          token_type: CAP.texprA_ApiToken(),
          value: "111"
        },
        {
          token_type: CAP.texprB_ApiToken(),
          value: "222"
        }
      ],
      token_value: "555"
    },
    {
      type: CAP.texprB_ApiToken().value,
      apis_called: [
        {
          token_type: CAP.texprA_ApiToken(),
          value: "000"
        }
      ],
      token_value: "444"
    },
  ];
  const endpoints = getEndpoints(RESOLVER, CAP.texprApiRequests(), capTokens);
  expect(endpoints.filter(ep => ep.kind === "api").length).toBe(3)
  {
    const a_api = endpoints.filter(ep => ep.kind === "api")[0]
    expect(a_api.token_value).toBe("000")
    expect(a_api.apis_called).toStrictEqual([])
    expect(a_api.endpoints.length).toBe(3)
    const b_api = a_api.endpoints.filter(ep => ep.kind === "api")[0]
    expect(b_api.token_value).toBe("444")
    expect(b_api.apis_called.length).toBe(1)
    expect(b_api.apis_called[0].value).toBe("000")
}
  {
    const a_api = endpoints.filter(ep => ep.kind === "api")[1]
    expect(a_api.token_value).toBe("111")
    expect(a_api.apis_called).toStrictEqual([])
    expect(a_api.endpoints.length).toBe(4)
    {
      const b_api = a_api.endpoints.filter(ep => ep.kind === "api")[0]
      expect(b_api.token_value).toBe("222")
      expect(b_api.apis_called.length).toBe(1)
      expect(b_api.apis_called[0].value).toBe("111")
      expect(b_api.endpoints.length).toBe(2)
      const c_api = b_api.endpoints.filter(ep => ep.kind === "api")[0]
      expect(c_api.token_value).toBe("555")
    }
    {
      const b_api = a_api.endpoints.filter(ep => ep.kind === "api")[1]
      expect(b_api.token_value).toBe("333")
      expect(b_api.apis_called.length).toBe(1)
      expect(b_api.apis_called[0].value).toBe("111")
      expect(b_api.endpoints.length).toBe(1)
    }

  }
})
