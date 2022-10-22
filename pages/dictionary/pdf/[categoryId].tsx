import React from 'react';
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import { getServerSideTranslations } from '../../../utils/localization';
import { DictionaryDataObject, fetchDictionary, parseCategory } from '../../../utils/getDataUtils';
import { ParsedUrlQuery } from 'querystring';
import { getCountryVariant } from '../../../utils/locales';

interface UrlParams extends ParsedUrlQuery {
  categoryId: string;
}

const DictionaryCategoryPDF = ({ dictionary, categoryId }: InferGetStaticPropsType<typeof getStaticProps>): JSX.Element => {
  const categoryObject = dictionary.categories.find((category) => category.id === categoryId);
  const category = categoryObject ? parseCategory(categoryObject, dictionary) : null;
  const country = getCountryVariant();

  if (!category) {
    return <div>Category not found.</div>;
  }
  return (
    <>
      <div>
        <div className="max-w-4xl m-auto">
          <h1 className="text-primary-blue mt-0 mb-3">{(category.nameUk, category.nameMain)}</h1>
          <table className="mt-8 text-xl font-medium">
            {category.translations.map((phrase, index) => (
              <tr key={index}>
                <td className="align-top p-2">
                  {phrase.getTranslation(country)}&nbsp; &nbsp;
                  <span className="text-gray-500">[{phrase.getTranscription(country)}]</span>
                </td>
                <td className="align-top p-2">
                  {phrase.getTranslation('uk')}&nbsp; &nbsp;
                  <span className="text-gray-500">[{phrase.getTranscription('uk')}]</span>
                </td>
              </tr>
            ))}
          </table>
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps<
  {
    dictionary: DictionaryDataObject;
    categoryId: string;
  },
  UrlParams
> = async ({ locale, params }) => {
  const dictionary = await fetchDictionary();
  const localeTranslations = await getServerSideTranslations(locale);

  return {
    props: {
      dictionary,
      categoryId: params?.categoryId ?? '',
      ...localeTranslations,
    },
  };
};

export const getStaticPaths: GetStaticPaths<UrlParams> = async () => {
  const dictionary = await fetchDictionary();

  return {
    // 'recdabyHkJhGf7U5D'
    paths: dictionary.categories.map((category) => ({ params: { categoryId: category.id } })),
    fallback: false,
  };
};

export default DictionaryCategoryPDF;
