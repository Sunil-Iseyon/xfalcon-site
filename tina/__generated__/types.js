export function gql(strings, ...args) {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (args[i] || "");
  });
  return str;
}
export const SiteConfigPartsFragmentDoc = gql`
    fragment SiteConfigParts on SiteConfig {
  __typename
  siteName
  tagline
  logoUrl
  accentColor
  social {
    __typename
    twitter
    linkedin
    github
  }
}
    `;
export const HomepagePartsFragmentDoc = gql`
    fragment HomepageParts on Homepage {
  __typename
  hero {
    __typename
    eyebrowText
    headline
    subheadline
    primaryCta {
      __typename
      label
      href
    }
    secondaryCta {
      __typename
      label
      href
    }
  }
  stats {
    __typename
    value
    label
  }
  scrollStory {
    __typename
    num
    heading
    body
    tag
    url
  }
  features {
    __typename
    icon
    title
    body
  }
  outro {
    __typename
    headline
    subheadline
    ctaPrimary {
      __typename
      label
      href
    }
    ctaSecondary {
      __typename
      label
      href
    }
  }
}
    `;
export const DemosPartsFragmentDoc = gql`
    fragment DemosParts on Demos {
  __typename
  name
  slug
  industry
  description
  kpis
  tags
  featured
  href
}
    `;
export const NavigationPartsFragmentDoc = gql`
    fragment NavigationParts on Navigation {
  __typename
  links {
    __typename
    label
    href
  }
  ctaLabel
  ctaHref
}
    `;
export const FooterPartsFragmentDoc = gql`
    fragment FooterParts on Footer {
  __typename
  tagline
  copyright
  linkGroups {
    __typename
    title
    links {
      __typename
      label
      href
    }
  }
  socialLinks {
    __typename
    label
    href
  }
}
    `;
export const PagesPartsFragmentDoc = gql`
    fragment PagesParts on Pages {
  __typename
  title
  slug
  content
}
    `;
export const SiteConfigDocument = gql`
    query siteConfig($relativePath: String!) {
  siteConfig(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...SiteConfigParts
  }
}
    ${SiteConfigPartsFragmentDoc}`;
export const SiteConfigConnectionDocument = gql`
    query siteConfigConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: SiteConfigFilter) {
  siteConfigConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...SiteConfigParts
      }
    }
  }
}
    ${SiteConfigPartsFragmentDoc}`;
export const HomepageDocument = gql`
    query homepage($relativePath: String!) {
  homepage(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...HomepageParts
  }
}
    ${HomepagePartsFragmentDoc}`;
export const HomepageConnectionDocument = gql`
    query homepageConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: HomepageFilter) {
  homepageConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...HomepageParts
      }
    }
  }
}
    ${HomepagePartsFragmentDoc}`;
export const DemosDocument = gql`
    query demos($relativePath: String!) {
  demos(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...DemosParts
  }
}
    ${DemosPartsFragmentDoc}`;
export const DemosConnectionDocument = gql`
    query demosConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: DemosFilter) {
  demosConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...DemosParts
      }
    }
  }
}
    ${DemosPartsFragmentDoc}`;
export const NavigationDocument = gql`
    query navigation($relativePath: String!) {
  navigation(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...NavigationParts
  }
}
    ${NavigationPartsFragmentDoc}`;
export const NavigationConnectionDocument = gql`
    query navigationConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: NavigationFilter) {
  navigationConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...NavigationParts
      }
    }
  }
}
    ${NavigationPartsFragmentDoc}`;
export const FooterDocument = gql`
    query footer($relativePath: String!) {
  footer(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...FooterParts
  }
}
    ${FooterPartsFragmentDoc}`;
export const FooterConnectionDocument = gql`
    query footerConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: FooterFilter) {
  footerConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...FooterParts
      }
    }
  }
}
    ${FooterPartsFragmentDoc}`;
export const PagesDocument = gql`
    query pages($relativePath: String!) {
  pages(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...PagesParts
  }
}
    ${PagesPartsFragmentDoc}`;
export const PagesConnectionDocument = gql`
    query pagesConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: PagesFilter) {
  pagesConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...PagesParts
      }
    }
  }
}
    ${PagesPartsFragmentDoc}`;
export function getSdk(requester) {
  return {
    siteConfig(variables, options) {
      return requester(SiteConfigDocument, variables, options);
    },
    siteConfigConnection(variables, options) {
      return requester(SiteConfigConnectionDocument, variables, options);
    },
    homepage(variables, options) {
      return requester(HomepageDocument, variables, options);
    },
    homepageConnection(variables, options) {
      return requester(HomepageConnectionDocument, variables, options);
    },
    demos(variables, options) {
      return requester(DemosDocument, variables, options);
    },
    demosConnection(variables, options) {
      return requester(DemosConnectionDocument, variables, options);
    },
    navigation(variables, options) {
      return requester(NavigationDocument, variables, options);
    },
    navigationConnection(variables, options) {
      return requester(NavigationConnectionDocument, variables, options);
    },
    footer(variables, options) {
      return requester(FooterDocument, variables, options);
    },
    footerConnection(variables, options) {
      return requester(FooterConnectionDocument, variables, options);
    },
    pages(variables, options) {
      return requester(PagesDocument, variables, options);
    },
    pagesConnection(variables, options) {
      return requester(PagesConnectionDocument, variables, options);
    }
  };
}
import { createClient } from "tinacms/dist/client";
const generateRequester = (client) => {
  const requester = async (doc, vars, options) => {
    let url = client.apiUrl;
    if (options?.branch) {
      const index = client.apiUrl.lastIndexOf("/");
      url = client.apiUrl.substring(0, index + 1) + options.branch;
    }
    const data = await client.request({
      query: doc,
      variables: vars,
      url
    }, options);
    return { data: data?.data, errors: data?.errors, query: doc, variables: vars || {} };
  };
  return requester;
};
export const ExperimentalGetTinaClient = () => getSdk(
  generateRequester(
    createClient({
      url: "http://localhost:4001/graphql",
      queries
    })
  )
);
export const queries = (client) => {
  const requester = generateRequester(client);
  return getSdk(requester);
};
